// /* eslint-disable sort-keys-fix/sort-keys-fix */
import { proxy } from "comlink"
import { mergeTransactions } from "src/utils/integrations/etherscan-utils"
import { noop } from "src/utils/utils"

import {
  AuditLogOperation,
  EtherscanTransaction,
  FilterOptionsMap,
  Transaction,
  TRANSACTIONS_TYPES,
} from "../../interfaces"
import { ProgressCallback } from "../../stores/task-store"
import { getAssetMap } from "../core/assets-api"
import { getAccount } from "../database"
import { validateOperation } from "../database-utils"
import { findAuditLogsForTxId } from "./audit-logs-api"
import { getConnections } from "./connections/connections-api"
import { getFileImports } from "./file-imports/file-imports-api"

const _filterOrder: (keyof Transaction)[] = [
  "platform",
  "wallet",
  "type",
  "outgoingAsset",
  "incomingAsset",
  "feeAsset",
]
const _filterOrderBySpecificity: (keyof Transaction)[] = [
  "feeAsset",
  "incomingAsset",
  "outgoingAsset",
  "type",
  "wallet",
  "platform",
]

export async function indexTransactions(progress: ProgressCallback, accountName: string) {
  const account = getAccount(accountName)
  progress([60, "Transactions: cleaning up stale indexes"])
  await account.transactionsDB.viewCleanup()
  progress([70, "Transactions: updating index for 'timestamp'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: ["timestamp"],
      name: "timestamp",
    },
  })
  progress([75, "Transactions: updating index for 'platform'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: [
        "platform",
        "timestamp",
        "wallet",
        "type",
        "outgoingAsset",
        "incomingAsset",
        "feeAsset",
      ], // MUST respect the order in _filterOrder
      name: "platform",
    },
  })
  progress([80, "Transactions: updating index for 'wallet'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: [
        "wallet",
        "timestamp",
        "platform",
        "type",
        "outgoingAsset",
        "incomingAsset",
        "feeAsset",
      ], // MUST respect the order in _filterOrder
      name: "wallet",
    },
  })
  progress([85, "Transactions: updating index for 'type'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: [
        "type",
        "timestamp",
        "platform",
        "wallet",
        "outgoingAsset",
        "incomingAsset",
        "feeAsset",
      ], // MUST respect the order in _filterOrder
      name: "type",
    },
  })
  progress([90, "Transactions: updating index for 'outgoingAsset'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: [
        "outgoingAsset",
        "timestamp",
        "platform",
        "wallet",
        "type",
        "incomingAsset",
        "feeAsset",
      ], // MUST respect the order in _filterOrder
      name: "outgoingAsset",
    },
  })
  progress([95, "Transactions: updating index for 'incomingAsset'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: [
        "incomingAsset",
        "timestamp",
        "platform",
        "wallet",
        "type",
        "outgoingAsset",
        "feeAsset",
      ], // MUST respect the order in _filterOrder
      name: "incomingAsset",
    },
  })
  progress([99, "Transactions: updating index for 'incomingAsset'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: [
        "feeAsset",
        "timestamp",
        "platform",
        "wallet",
        "type",
        "outgoingAsset",
        "incomingAsset",
      ], // MUST respect the order in _filterOrder
      name: "feeAsset",
    },
  })
}

type FindTransactionsRequest = {
  fields?: string[]
  filters?: Partial<Record<keyof Transaction, string | number>>
  limit?: number
  /**
   * orderBy = timestamp, always
   *
   * @default "desc"
   */
  order?: "asc" | "desc"
  selectorOverrides?: PouchDB.Find.Selector
  skip?: number
}

export async function getTransaction(accountName: string, id: string) {
  const account = getAccount(accountName)
  return account.transactionsDB.get(id)
}

export async function findTransactions(request: FindTransactionsRequest = {}, accountName: string) {
  const account = getAccount(accountName)
  const { indexes } = await account.transactionsDB.getIndexes()
  if (indexes.length === 1) {
    // await indexTransactions(console.log, accountName)
    await indexTransactions(noop, accountName)
  }

  const { filters = {}, limit, skip, order = "desc", fields, selectorOverrides = {} } = request

  // Algorithm to help PouchDB find the best index to use
  const preferredFilter = _filterOrderBySpecificity.find((x) => filters[x])

  const selector: PouchDB.Find.Selector = !preferredFilter
    ? { timestamp: { $exists: true } }
    : {
        [preferredFilter]: filters[preferredFilter],
        timestamp: { $exists: true },
      }

  // FIXME: seems to be breaking - is it no longer needed?
  // if (preferredFilter) {
  //   _filterOrder.forEach((filter) => {
  //     if (filter === preferredFilter) return
  //     selector[filter] = filters[filter] ? filters[filter] : { $exists: true }
  //   })
  // }

  const sort: PouchDB.Find.FindRequest<Transaction>["sort"] = !preferredFilter
    ? [{ timestamp: order }]
    : [{ [preferredFilter]: order }, { timestamp: order }]

  const _req: PouchDB.Find.FindRequest<Transaction> = {
    fields,
    limit,
    selector: {
      ...selector,
      ...selectorOverrides,
    },
    skip,
    sort,
  }
  // console.log("📜 LOG > findTransactions > _req:", _req)
  // const explain = await (account.transactionsDB as any).explain(_req)
  // console.log("📜 LOG > findTransactions > explain:", explain.index)

  //
  const { docs, warning } = await account.transactionsDB.find(_req)
  if (warning) console.warn("findTransactions", warning)
  return docs as Transaction[]
}

export async function countTransactions(accountName: string) {
  const account = getAccount(accountName)
  const indexes = await account.transactionsDB.allDocs({
    // Prefix search
    // https://pouchdb.com/api.html#batch_fetch
    endkey: `_design\ufff0`,

    include_docs: false,
    startkey: "_design",
  })
  const result = await account.transactionsDB.allDocs({ include_docs: false, limit: 1 })
  return result.total_rows - indexes.rows.length
}

export function subscribeToTransactions(callback: () => void, accountName: string) {
  const account = getAccount(accountName)
  const changesSub = account.transactionsDB
    .changes({
      live: true,
      since: "now",
    })
    .on("change", callback)

  return proxy(() => {
    try {
      changesSub.cancel()
    } catch {}
  })
}

export async function autoMergeTransactions(
  accountName: string,
  progress: ProgressCallback = noop,
  signal?: AbortSignal
) {
  const account = getAccount(accountName)
  progress([0, "Fetching all transactions"])
  const transactions = await findTransactions({}, accountName)

  const ethereumTransactions = transactions.filter(
    (tx) => tx.platform === "ethereum"
  ) as EtherscanTransaction[]

  if (signal?.aborted) {
    throw new Error(signal.reason)
  }
  progress([25, `Processing ${ethereumTransactions.length} Ethereum transactions`])
  const { merged, deduplicateMap } = mergeTransactions(ethereumTransactions)

  //
  if (signal?.aborted) {
    throw new Error(signal.reason)
  }
  //

  progress([50, `Saving ${merged.length} merged transactions`])
  const mergedUpdates = await account.transactionsDB.bulkDocs(merged)
  validateOperation(mergedUpdates)

  progress([70, `Updating the audit logs of ${merged.length} merged transactions`])
  for (const tx of merged) {
    const deduplicated = deduplicateMap[tx._id]

    for (const deduplicatedTx of deduplicated) {
      const auditLogs = await findAuditLogsForTxId(deduplicatedTx._id, accountName)

      for (const auditLog of auditLogs) {
        auditLog.txId = tx._id
      }

      const logUpdates = await account.auditLogsDB.bulkDocs(auditLogs)
      validateOperation(logUpdates)
    }
  }

  const deduplicated = Object.values(deduplicateMap).flat()
  progress([90, `Deleting ${deduplicated.length} deduplicated transactions`])
  const deduplicatedUpdates = await account.transactionsDB.bulkDocs(
    deduplicated.map((tx) => ({ _deleted: true, _id: tx._id, _rev: tx._rev } as never))
  )
  validateOperation(deduplicatedUpdates)

  progress([100, "Done"])
}

export async function updateTransaction(
  accountName: string,
  id: string,
  update: Partial<Transaction>
) {
  const account = getAccount(accountName)
  const existing = await account.transactionsDB.get(id)
  const newValue = { ...existing, ...update }
  const dbUpdate = await account.transactionsDB.put(newValue)
  validateOperation([dbUpdate])
}

export async function getFilterMap(accountName: string) {
  const platforms = new Set<string>()
  const assetIds = new Set<string>()
  const wallets = new Set<string>()
  const operations = new Set<AuditLogOperation>()

  const fileImports = await getFileImports(accountName)
  for (const fileImport of fileImports) {
    const { meta } = fileImport

    if (!meta) {
      continue
    }

    platforms.add(meta.platform)
    meta.assetIds.forEach((x) => assetIds.add(x))
    meta.wallets.forEach((x) => wallets.add(x))
    meta.operations.forEach((x) => operations.add(x))
  }

  const connections = await getConnections(accountName)
  for (const connection of connections) {
    const { platform, meta } = connection

    if (!meta) {
      continue
    }

    platforms.add(platform)
    meta.assetIds.forEach((x) => assetIds.add(x))
    meta.wallets.forEach((x) => wallets.add(x))
    meta.operations.forEach((x) => operations.add(x))
  }

  const assetIdOptions = [...assetIds].sort()

  const map: FilterOptionsMap = {
    assetId: assetIdOptions,
    feeAsset: assetIdOptions,
    incomingAsset: assetIdOptions,
    operation: [...operations].sort(),
    outgoingAsset: assetIdOptions,
    platform: [...platforms].sort(),
    type: TRANSACTIONS_TYPES,
    wallet: [...wallets].sort(),
  }

  return map
}

export async function detectSpamTransactions(
  accountName: string,
  progress: ProgressCallback = noop,
  signal?: AbortSignal
) {
  const account = getAccount(accountName)
  progress([0, "Fetching all transactions"])
  const transactions = await findTransactions({}, accountName)

  const ethereumTransactions = transactions.filter(
    (tx) => tx.platform === "ethereum"
  ) as EtherscanTransaction[]

  if (signal?.aborted) {
    throw new Error(signal.reason)
  }
  progress([33, `Processing ${ethereumTransactions.length} Ethereum transactions`])
  const filterMap = await getFilterMap(accountName)
  const assetMap = await getAssetMap(accountName, filterMap.assetId)

  const spam = ethereumTransactions.filter((tx) => {
    // it means the user created the transaction
    if (tx.fee) return false

    if (tx.incomingAsset && !assetMap[tx.incomingAsset]?.coingeckoId) {
      return true
    }

    if (tx.outgoingAsset && !assetMap[tx.outgoingAsset]?.coingeckoId) {
      return true
    }

    return false
  })

  //
  if (signal?.aborted) {
    throw new Error(signal.reason)
  }
  //

  progress([66, `Deleting ${spam.length} spam transactions`])
  for (const spamTx of spam) {
    const auditLogs = await findAuditLogsForTxId(spamTx._id, accountName)

    const logUpdates = await account.auditLogsDB.bulkDocs(
      auditLogs.map((log) => ({ _deleted: true, _id: log._id, _rev: log._rev } as never))
    )
    validateOperation(logUpdates)
  }

  const updates = await account.transactionsDB.bulkDocs(
    spam.map((tx) => ({ _deleted: true, _id: tx._id, _rev: tx._rev } as never))
  )
  validateOperation(updates)

  progress([100, "Done"])
}
