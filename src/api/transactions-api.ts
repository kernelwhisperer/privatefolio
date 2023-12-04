// /* eslint-disable sort-keys-fix/sort-keys-fix */
// import { Transaction } from "../interfaces"
// import { ActiveFilterMap } from "../stores/transaction-store"
// import { transactionsDB } from "./database"

import { Transaction } from "../interfaces"
import { transactionsDB } from "./database"

// const _filterOrder = ["integration", "wallet", "operation", "symbol"]
// const _filterOrderBySpecificity = ["symbol", "operation", "wallet", "integration"]

// export async function indexTransactions() {
//   const { indexes } = await transactionsDB.getIndexes()
//   console.log("📜 LOG > indexTransactions > indexes:", indexes)

//   for (const { name, ddoc } of indexes) {
//     if (!ddoc) continue
//     await transactionsDB.deleteIndex({ ddoc, name })
//   }
//   console.log("📜 LOG > indexTransactions > deleted")

//   await transactionsDB.createIndex({
//     index: {
//       // MUST respect the order in _orderedFilters
//       fields: ["integration", "timestamp", "wallet", "operation", "symbol"],
//       name: "integration",
//     },
//   })
//   console.log("📜 LOG > indexTransactions > created", 1)
//   await transactionsDB.createIndex({
//     index: {
//       // MUST respect the order in _orderedFilters
//       fields: ["wallet", "timestamp", "integration", "operation", "symbol"],
//       name: "wallet",
//     },
//   })
//   console.log("📜 LOG > indexTransactions > created", 2)
//   await transactionsDB.createIndex({
//     index: {
//       // MUST respect the order in _orderedFilters
//       fields: ["operation", "timestamp", "integration", "wallet", "symbol"],
//       name: "operation",
//     },
//   })
//   console.log("📜 LOG > indexTransactions > created", 3)
//   await transactionsDB.createIndex({
//     index: {
//       // MUST respect the order in _orderedFilters
//       fields: ["symbol", "timestamp", "integration", "wallet", "operation"],
//       name: "symbol",
//     },
//   })
//   console.log("📜 LOG > indexTransactions > created", 4)
//   await transactionsDB.createIndex({
//     index: {
//       fields: ["timestamp"],
//       name: "timestamp",
//     },
//   })
//   console.log("📜 LOG > indexTransactions > created", 5)
// }

// type FindTransactionsRequest = {
//   fields?: string[]
//   filters?: ActiveFilterMap
//   limit?: number
//   /**
//    * orderBy = timestamp, always
//    *
//    * @default "desc"
//    */
//   order?: "asc" | "desc"
//   skip?: number
// }

// export async function findTransactions(request: FindTransactionsRequest = {}) {
//   const { filters = {}, limit, skip, order = "desc", fields } = request

//   // Algorithm to help PouchDB find the best index to use
//   const preferredFilter = _filterOrderBySpecificity.find((x) => filters[x])

//   const selector: PouchDB.Find.Selector = !preferredFilter
//     ? { timestamp: { $exists: true } }
//     : {
//         [preferredFilter]: filters[preferredFilter],
//         timestamp: { $exists: true },
//       }

//   if (preferredFilter) {
//     _filterOrder.forEach((filter) => {
//       if (filter === preferredFilter) return
//       selector[filter] = filters[filter] ? filters[filter] : { $exists: true }
//     })
//   }

//   const sort: PouchDB.Find.FindRequest<Transaction>["sort"] = !preferredFilter
//     ? [{ timestamp: order }]
//     : [{ [preferredFilter]: order }, { timestamp: order }]

//   const _req: PouchDB.Find.FindRequest<Transaction> = {
//     fields,
//     limit,
//     selector,
//     skip,
//     sort,
//   }
//   console.log("📜 LOG > findTransactions > _req:", _req)

//   const explain = await (transactionsDB as any).explain(_req)
//   console.log("📜 LOG > findTransactions > explain:", explain.index)

//   //
//   const { docs, warning } = await transactionsDB.find(_req)
//   if (warning) console.warn("findTransactions", warning)
//   return docs as Transaction[]
// }

export async function getTransactions() {
  const result = await transactionsDB.allDocs({ include_docs: true })
  console.log("📜 LOG > getTransactions > result:", result)

  return result.rows.map((x) => x.doc) as Transaction[]
}
