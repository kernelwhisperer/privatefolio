import { proxy } from "comlink"
import { getAddress } from "ethers"
import { ProgressCallback } from "src/stores/task-store"

import { AuditLog, AuditLogOperation, Connection, Transaction } from "../../../interfaces"
import { hashString } from "../../../utils/utils"
import { getAccount } from "../../database"
import { FullEtherscanProvider } from "./etherscan-rpc"
import { parser } from "./evm-parser"

export async function addConnection(
  connection: Omit<Connection, "_id" | "_rev" | "timestamp" | "syncedAt">,
  accountName = "main"
) {
  let { address, integration, label } = connection

  address = getAddress(address)
  const account = getAccount(accountName)

  const timestamp = new Date().getTime()
  const _id = hashString(`${integration}_${address}_${label}`)

  await account.connectionsDB.put({
    ...connection,
    _id,
    _rev: undefined,
    address,
    timestamp,
  })

  return (await account.connectionsDB.get(_id)) as Connection
}

export async function getConnections(accountName = "main") {
  const account = getAccount(accountName)
  const res = await account.connectionsDB.allDocs<Connection>({
    include_docs: true,
  })
  return res.rows.map((row) => row.doc) as Connection[]
}

export async function removeConnection(
  connection: Connection,
  progress: ProgressCallback,
  accountName = "main"
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
  progress([95, `Removing connection`])
  const res = await account.connectionsDB.remove(connection)
  progress([100, `Removal complete`])
  return res.ok
}

export function subscribeToConnections(callback: () => void, accountName = "main") {
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
  progress: ProgressCallback,
  connection: Connection,
  accountName = "main"
) {
  const rpcProvider = new FullEtherscanProvider()
  const rows = await rpcProvider.getHistory(connection.address)
  console.log("📜 LOG > syncConnection > rows:", rows)

  const logs: AuditLog[] = []
  let transactions: Transaction[] = []
  const symbolMap: Record<string, boolean> = {}
  const walletMap: Record<string, boolean> = {}
  const operationMap: Partial<Record<AuditLogOperation, boolean>> = {}

  progress([0, `Parsing ${rows.length} rows`])
  rows.forEach((row, index) => {
    try {
      if (index !== 0 && (index + 1) % 1000 === 0) {
        progress([(index * 50) / rows.length, `Parsing row ${index + 1}`])
      }
      const { logs: newLogs, txns } = parser(row, index, connection)

      for (const log of newLogs) {
        logs.push(log)
        symbolMap[log.symbol] = true
        walletMap[log.wallet] = true
        operationMap[log.operation] = true
      }

      if (txns) {
        transactions = transactions.concat(txns)
      }
    } catch (error) {
      progress([0, `Error parsing row ${index + 1}: ${String(error)}`])
    }
  })

  const account = getAccount(accountName)

  // save logs
  progress([60, `Saving ${logs.length} audit logs to disk`])
  await account.auditLogsDB.bulkDocs(logs)

  // save transactions
  progress([80, `Saving ${transactions.length} transactions to disk`])
  await account.transactionsDB.bulkDocs(transactions)

  // save metadata
  const metadata: Connection["meta"] = {
    logs: logs.length,
    operations: Object.keys(operationMap) as AuditLogOperation[],
    rows: rows.length - 1,
    symbols: Object.keys(symbolMap),
    transactions: transactions.length,
    wallets: Object.keys(walletMap),
  }

  connection.meta = metadata
  console.log("📜 LOG > metadata:", metadata)
  connection.syncedAt = new Date().getTime()

  await account.connectionsDB.put(connection)
  return connection
}
