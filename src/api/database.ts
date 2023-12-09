import PouchDB from "pouchdb"
import PouchDBFind from "pouchdb-find"

import { AuditLog, BalanceMap, FileImport, SavedPrice, Transaction } from "../interfaces"

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

export let fileImportsDB = new PouchDB<Omit<FileImport, "_rev">>("file-imports", defaultDbOptions)
export let auditLogsDB = new PouchDB<AuditLog>("audit-logs", defaultDbOptions)
export let transactionsDB = new PouchDB<Transaction>("transactions", defaultDbOptions)
export let balancesDB = new PouchDB<BalanceMap>("balances", defaultDbOptions)
export let dailyPricesDB = new PouchDB<SavedPrice>("daily-prices", defaultDbOptions)
export let keyValueDB = new PouchDB<{ value: any }>("key-value", defaultDbOptions)

// try {
//   PouchDB.replicate("file-imports", "http://localhost:5984/file-imports", { live: true })
//   PouchDB.replicate("audit-logs", "http://localhost:5984/audit-logs", { live: true })
// } catch {
//   console.log("Error replicating database")
// }

fileImportsDB.on("indexing", function (event) {
  console.log("Indexing fileImportsDB:", event)
  // called when indexes are updated
})
auditLogsDB.on("indexing", function (event) {
  console.log("Indexing auditLogsDB:", event)
  // called when indexes are updated
})

export async function resetDatabase() {
  await fileImportsDB.destroy()
  await auditLogsDB.destroy()
  await transactionsDB.destroy()
  await balancesDB.destroy()
  await dailyPricesDB.destroy()
  await keyValueDB.destroy()
  fileImportsDB = new PouchDB<Omit<FileImport, "_rev">>("file-imports", defaultDbOptions)
  auditLogsDB = new PouchDB<AuditLog>("audit-logs", defaultDbOptions)
  transactionsDB = new PouchDB<Transaction>("transactions", defaultDbOptions)
  balancesDB = new PouchDB<BalanceMap>("balances", defaultDbOptions)
  dailyPricesDB = new PouchDB<SavedPrice>("daily-prices", defaultDbOptions)
  keyValueDB = new PouchDB<{ value: any }>("key-value", defaultDbOptions)
}
