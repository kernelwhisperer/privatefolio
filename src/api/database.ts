import PouchDB from "pouchdb"
import PouchDBFind from "pouchdb-find"

import {
  AuditLog,
  BalanceMap,
  Connection,
  FileImport,
  SavedPrice,
  Transaction,
} from "../interfaces"

if (typeof window !== "undefined") {
  throw new Error("Database should not be initialized in the browser, only in the web worker")
}

// declare module "pouchdb-core" {
//   interface Database<Content extends {} = {}> {
//     explain(query: any): Promise<any>
//   }
// }
PouchDB.plugin(PouchDBFind)

const defaultDbOptions = {
  auto_compaction: true,
  revs_limit: 1,
}

export let connectionsDB = new PouchDB<Connection>("connections", defaultDbOptions)
export let fileImportsDB = new PouchDB<Omit<FileImport, "_rev">>("file-imports", defaultDbOptions)
export let auditLogsDB = new PouchDB<AuditLog>("audit-logs", defaultDbOptions)
export let transactionsDB = new PouchDB<Transaction>("transactions", defaultDbOptions)
export let balancesDB = new PouchDB<BalanceMap>("balances", defaultDbOptions)
export let keyValueDB = new PouchDB<{ value: unknown }>("key-value", defaultDbOptions)
export let dailyPricesDB = new PouchDB<SavedPrice>("daily-prices", defaultDbOptions)

// try {
//   PouchDB.replicate("file-imports", "http://localhost:5984/file-imports", { live: true })
//   PouchDB.replicate("audit-logs", "http://localhost:5984/audit-logs", { live: true })
// } catch {
//   console.log("Error replicating database")
// }

transactionsDB.on("indexing", function (event) {
  console.log("Indexing", event)
})
auditLogsDB.on("indexing", function (event) {
  console.log("Indexing", event)
})

export async function resetDatabase(removeDailyPrices = false) {
  await connectionsDB.destroy()
  await fileImportsDB.destroy()
  await auditLogsDB.destroy()
  await transactionsDB.destroy()
  await balancesDB.destroy()
  await keyValueDB.destroy()
  if (removeDailyPrices) await dailyPricesDB.destroy()
  connectionsDB = new PouchDB<Connection>("connections", defaultDbOptions)
  fileImportsDB = new PouchDB<FileImport>("file-imports", defaultDbOptions)
  auditLogsDB = new PouchDB<AuditLog>("audit-logs", defaultDbOptions)
  transactionsDB = new PouchDB<Transaction>("transactions", defaultDbOptions)
  balancesDB = new PouchDB<BalanceMap>("balances", defaultDbOptions)
  keyValueDB = new PouchDB<{ value: unknown }>("key-value", defaultDbOptions)
  if (removeDailyPrices) dailyPricesDB = new PouchDB<SavedPrice>("daily-prices", defaultDbOptions)
}
