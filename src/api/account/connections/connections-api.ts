import { proxy } from "comlink"
import { BlockTag, getAddress } from "ethers"
import { validateOperation } from "src/api/database-utils"
import { ProgressCallback } from "src/stores/task-store"

import { AuditLog, AuditLogOperation, Connection, Transaction } from "../../../interfaces"
import { hashString, noop } from "../../../utils/utils"
import { getAccount } from "../../database"
import { getValue, setValue } from "../kv-api"
import { FullEtherscanProvider } from "./etherscan-rpc"
import { erc20Parser, parser } from "./evm-parser"

export async function addConnection(
  connection: Omit<Connection, "_id" | "_rev" | "timestamp" | "syncedAt">,
  accountName: string
) {
  let { address, platform, label } = connection

  address = getAddress(address)
  const account = getAccount(accountName)

  const timestamp = new Date().getTime()
  const _id = hashString(`con_${platform}_${address}_${label}`)

  await account.connectionsDB.put<Connection>({
    ...connection,
    _id,
    _rev: undefined as any,
    address,
    timestamp,
  })

  return (await account.connectionsDB.get(_id)) as Connection
}

export async function getConnections(accountName: string) {
  const account = getAccount(accountName)
  const res = await account.connectionsDB.allDocs<Connection>({
    include_docs: true,
  })
  return res.rows.map((row) => row.doc) as Connection[]
}

export async function removeConnection(
  connection: Connection,
  progress: ProgressCallback,
  accountName: string
) {
  const account = getAccount(accountName)

  // Remove audit logs
  const logs = await account.auditLogsDB.allDocs({
    // Prefix search
    // https://pouchdb.com/api.html#batch_fetch
    endkey: `${connection._id}\ufff0`,
    startkey: connection._id,
  } as PouchDB.Core.AllDocsWithinRangeOptions)
  progress([25, `Removing ${logs.rows.length} audit logs`])
  await account.auditLogsDB.bulkDocs(
    logs.rows.map((row) => ({ _deleted: true, _id: row.id, _rev: row.value.rev } as never))
  )

  // Remove transactions
  const txns = await account.transactionsDB.allDocs({
    // Prefix search
    // https://pouchdb.com/api.html#batch_fetch
    endkey: `${connection._id}\ufff0`,
    startkey: connection._id,
  } as PouchDB.Core.AllDocsWithinRangeOptions)
  progress([50, `Removing ${txns.rows.length} transactions`])
  await account.transactionsDB.bulkDocs(
    txns.rows.map((row) => ({ _deleted: true, _id: row.id, _rev: row.value.rev } as never))
  )

  //
  await setValue(connection._id, 0, accountName)
  progress([95, `Removing connection`])
  const res = await account.connectionsDB.remove(connection)
  progress([100, `Removal complete`])
  return res.ok
}

export function subscribeToConnections(callback: () => void, accountName: string) {
  const account = getAccount(accountName)
  const changesSub = account.connectionsDB
    .changes({
      live: true,
      since: "now",
    })
    .on("change", callback)

  return proxy(() => {
    try {
      // console.log("📜 LOG > subscribeToFileImports > unsubbing")
      changesSub.cancel()
    } catch {}
  })
}

// const testAddress = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"

export async function syncConnection(
  progress: ProgressCallback = noop,
  connection: Connection,
  accountName: string,
  since?: BlockTag
) {
  const account = getAccount(accountName)
  const rpcProvider = new FullEtherscanProvider()

  if (since === undefined) {
    since = (await getValue<BlockTag>(connection._id, "0", accountName)) as string
  }
  progress([0, `Starting from block number ${since}`])

  const logMap: Record<string, AuditLog> = {}
  const txMap: Record<string, Transaction> = {}
  const assetMap: Record<string, boolean> = {}
  const walletMap: Record<string, boolean> = {}
  const operationMap: Partial<Record<AuditLogOperation, boolean>> = {}

  // normal transactions
  const normal = await rpcProvider.getTransactions(connection.address, since)
  console.log("📜 LOG > normal:", normal)

  progress([0, `Fetching normal transactions`])
  progress([10, `Parsing ${normal.length} normal transactions`])
  normal.forEach((row, index) => {
    try {
      if (index !== 0 && (index + 1) % 1000 === 0) {
        progress([(index * 15) / normal.length, `Parsing row ${index + 1}`])
      }
      const { logs, txns = [] } = parser(row, index, connection)

      if (logs.length === 0) console.log("📜 LOG > logs.length === 0:", row)

      for (const log of logs) {
        logMap[log._id] = log
        assetMap[log.assetId] = true
        walletMap[log.wallet] = true
        operationMap[log.operation] = true
      }

      for (const transaction of txns) {
        txMap[transaction._id] = transaction
      }
    } catch (error) {
      progress([0, `Error parsing row ${index + 1}: ${String(error)}`])
    }
  })

  // internal transactions
  const internal = await rpcProvider.getInternalTransactions(connection.address, since)
  console.log("📜 LOG > internal:", internal)

  progress([25, `Fetching internal transactions`])
  progress([35, `Parsing ${internal.length} internal transactions`])
  internal.forEach((row, index) => {
    try {
      if (index !== 0 && (index + 1) % 1000 === 0) {
        progress([35 + (index * 15) / internal.length, `Parsing row ${index + 1}`])
      }
      const { logs, txns = [] } = parser(row, index, connection)
      if (logs.length === 0) console.log("📜 LOG > logs.length === 0:", row)

      for (const log of logs) {
        logMap[log._id] = log
        assetMap[log.assetId] = true
        walletMap[log.wallet] = true
        operationMap[log.operation] = true
      }

      for (const transaction of txns) {
        txMap[transaction._id] = transaction
      }
    } catch (error) {
      progress([0, `Error parsing row ${index + 1}: ${String(error)}`])
    }
  })

  // erc20 transactions
  const erc20 = await rpcProvider.getErc20Transactions(connection.address, since)
  console.log("📜 LOG > erc20:", erc20)

  progress([50, `Fetching erc20 transactions`])
  progress([60, `Parsing ${erc20.length} erc20 transactions`])
  erc20.forEach((row, index) => {
    try {
      if (index !== 0 && (index + 1) % 1000 === 0) {
        progress([60 + (index * 15) / erc20.length, `Parsing row ${index + 1}`])
      }
      const { logs, txns = [] } = erc20Parser(row, index, connection)
      if (logs.length === 0) console.log("📜 LOG > logs.length === 0:", row)

      for (const log of logs) {
        logMap[log._id] = log
        assetMap[log.assetId] = true
        walletMap[log.wallet] = true
        operationMap[log.operation] = true
      }

      for (const transaction of txns) {
        txMap[transaction._id] = transaction
      }
    } catch (error) {
      progress([0, `Error parsing row ${index + 1}: ${String(error)}`])
    }
  })
  console.log("📜 LOG > erc20.forEach > logs:", logMap)

  // save logs
  const logIds = Object.keys(logMap).map((x) => ({ id: x }))
  // TODO bug: bulkDocs hangs if docs.length === 0
  if (logIds.length > 0) {
    progress([80, `Saving ${logIds.length} audit logs to disk`])
    const { results: logDocs } = await account.auditLogsDB.bulkGet({ docs: logIds })

    const logUpdates = await account.auditLogsDB.bulkDocs(
      logDocs.map((doc) => ({
        ...logMap[doc.id],
        _id: doc.id,
        _rev: "ok" in doc.docs[0] ? doc.docs[0].ok._rev : undefined,
      }))
    )
    validateOperation(logUpdates)
  }

  // save transactions
  const txIds = Object.keys(txMap).map((x) => ({ id: x }))
  // TODO bug: bulkDocs hangs if docs.length === 0
  if (txIds.length > 0) {
    progress([90, `Saving ${txIds.length} transactions to disk`])
    const { results: txDocs } = await account.transactionsDB.bulkGet({ docs: txIds })
    const txUpdates = await account.transactionsDB.bulkDocs(
      txDocs.map((doc) => ({
        ...txMap[doc.id],
        _id: doc.id,
        _rev: "ok" in doc.docs[0] ? doc.docs[0].ok._rev : undefined,
      }))
    )
    validateOperation(txUpdates)
  }

  // save metadata
  const metadata: Connection["meta"] = {
    assetIds: Object.keys(assetMap),
    logs: logIds.length,
    operations: Object.keys(operationMap) as AuditLogOperation[],
    rows: normal.length + internal.length + erc20.length,
    transactions: txIds.length,
    wallets: Object.keys(walletMap),
  }

  // set cursor
  if (normal.length > 0) {
    const newCursor = String(Number(normal[normal.length - 1].blockNumber) + 1)

    progress([95, `Setting cursor to block number ${newCursor}`])
    await setValue(connection._id, newCursor, accountName)
  }

  if (connection.meta && since !== 0) {
    connection.meta = {
      assetIds: [...new Set(connection.meta.assetIds.concat(metadata.assetIds))],
      logs: connection.meta.logs + metadata.logs,
      operations: [...new Set(connection.meta.operations.concat(metadata.operations))],
      rows: connection.meta.rows + metadata.rows,
      transactions: connection.meta.transactions + metadata.transactions,
      wallets: [...new Set(connection.meta.wallets.concat(metadata.wallets))],
    }
  } else {
    connection.meta = metadata
  }
  connection.syncedAt = new Date().getTime()

  progress([99, `Saving metadata`])
  await account.connectionsDB.put(connection)
  return connection
}
