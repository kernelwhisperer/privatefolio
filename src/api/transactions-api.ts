// /* eslint-disable sort-keys-fix/sort-keys-fix */
import { Transaction } from "../interfaces"
import { transactionsDB } from "./database"

const _filterOrder = ["integration", "wallet", "type", "outgoingSymbol", "incomingSymbol"]
const _filterOrderBySpecificity = [
  "outgoingSymbol",
  "incomingSymbol",
  "type",
  "wallet",
  "integration",
]

export async function indexTransactions() {
  await transactionsDB.createIndex({
    index: {
      // MUST respect the order in _filterOrder
      fields: ["integration", "timestamp", "wallet", "type", "outgoingSymbol", "incomingSymbol"],
      name: "integration",
    },
  })
  // console.log("📜 LOG > indexTransactions > created", 1)
  await transactionsDB.createIndex({
    index: {
      // MUST respect the order in _filterOrder
      fields: ["wallet", "timestamp", "integration", "type", "outgoingSymbol", "incomingSymbol"],
      name: "wallet",
    },
  })
  // console.log("📜 LOG > indexTransactions > created", 2)
  await transactionsDB.createIndex({
    index: {
      // MUST respect the order in _filterOrder
      fields: ["type", "timestamp", "integration", "wallet", "outgoingSymbol", "incomingSymbol"],
      name: "type",
    },
  })
  // console.log("📜 LOG > indexTransactions > created", 3)
  await transactionsDB.createIndex({
    index: {
      // MUST respect the order in _filterOrder
      fields: ["outgoingSymbol", "timestamp", "integration", "wallet", "type", "incomingSymbol"],
      name: "outgoingSymbol",
    },
  })
  // console.log("📜 LOG > indexTransactions > created", 4)
  await transactionsDB.createIndex({
    index: {
      // MUST respect the order in _filterOrder
      fields: ["incomingSymbol", "timestamp", "integration", "wallet", "type", "outgoingSymbol"],
      name: "incomingSymbol",
    },
  })
  // console.log("📜 LOG > indexTransactions > created", 5)
  await transactionsDB.createIndex({
    index: {
      fields: ["timestamp"],
      name: "timestamp",
    },
  })
  // console.log("📜 LOG > indexTransactions > created", 6)
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

export async function findTransactions(request: FindTransactionsRequest = {}) {
  await indexTransactions()

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
  const { docs, warning } = await transactionsDB.find(_req)
  if (warning) console.warn("findTransactions", warning)
  return docs as Transaction[]
}

export async function countTransactions() {
  const result = await transactionsDB.allDocs({ include_docs: false, limit: 1 })
  return result.total_rows
}
