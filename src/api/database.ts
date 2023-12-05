import PouchDB from "pouchdb"
import PouchDBFind from "pouchdb-find"

import { AuditLog, BalanceMap, FileImport, Transaction } from "../interfaces"

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

export const fileImportsDB = new PouchDB<Omit<FileImport, "_rev">>("file-imports", defaultDbOptions)
export const auditLogsDB = new PouchDB<AuditLog>("audit-logs", defaultDbOptions)
export const transactionsDB = new PouchDB<Transaction>("transactions", defaultDbOptions)
export const balancesDB = new PouchDB<BalanceMap>("balances", defaultDbOptions)
export const keyValueDB = new PouchDB<{ value: any }>("key-value", defaultDbOptions)

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
