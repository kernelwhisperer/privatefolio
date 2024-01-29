// /* eslint-disable sort-keys-fix/sort-keys-fix */
import { proxy } from "comlink"
import { noop } from "src/utils/utils"

import { Transaction } from "../../interfaces"
import { ProgressCallback } from "../../stores/task-store"
import { getAccount } from "../database"

const _filterOrder = ["integration", "wallet", "type", "outgoingAsset", "incomingAsset"]
const _filterOrderBySpecificity = [
  "outgoingAsset",
  "incomingAsset",
  "type",
  "wallet",
  "integration",
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
  progress([75, "Transactions: updating index for 'integration'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: ["integration", "timestamp", "wallet", "type", "outgoingAsset", "incomingAsset"], // MUST respect the order in _filterOrder
      name: "integration",
    },
  })
  progress([80, "Transactions: updating index for 'wallet'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: ["wallet", "timestamp", "integration", "type", "outgoingAsset", "incomingAsset"], // MUST respect the order in _filterOrder
      name: "wallet",
    },
  })
  progress([85, "Transactions: updating index for 'type'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: ["type", "timestamp", "integration", "wallet", "outgoingAsset", "incomingAsset"], // MUST respect the order in _filterOrder
      name: "type",
    },
  })
  progress([90, "Transactions: updating index for 'outgoingAsset'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: ["outgoingAsset", "timestamp", "integration", "wallet", "type", "incomingAsset"], // MUST respect the order in _filterOrder
      name: "outgoingAsset",
    },
  })
  progress([95, "Transactions: updating index for 'incomingAsset'"])
  await account.transactionsDB.createIndex({
    index: {
      fields: ["incomingAsset", "timestamp", "integration", "wallet", "type", "outgoingAsset"], // MUST respect the order in _filterOrder
      name: "incomingAsset",
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

  if (preferredFilter) {
    _filterOrder.forEach((filter) => {
      if (filter === preferredFilter) return
      selector[filter] = filters[filter] ? filters[filter] : { $exists: true }
    })
  }

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
  // const explain = await (transactionsDB as any).explain(_req)
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
