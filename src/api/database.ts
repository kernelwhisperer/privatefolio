import PouchDB from "pouchdb"
import PouchDBFind from "pouchdb-find"

import { AuditLog, FileImport } from "../interfaces"

PouchDB.plugin(PouchDBFind)

export const fileImportsDB = new PouchDB<FileImport>("file-imports")
export const auditLogsDB = new PouchDB<AuditLog>("audit-logs")

try {
  PouchDB.replicate("file-imports", "http://localhost:5984/file-imports", { live: true })
  PouchDB.replicate("audit-logs", "http://localhost:5984/audit-logs", { live: true })
} catch {
  console.log("Error replicating database")
}
