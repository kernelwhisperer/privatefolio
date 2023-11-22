import PouchDB from "pouchdb"

export const fileImportsDB = new PouchDB("file-imports")
export const auditLogsDB = new PouchDB("audit-logs")

PouchDB.replicate("file-imports", "http://localhost:5984/file-imports", { live: true })
PouchDB.replicate("audit-logs", "http://localhost:5984/audit-logs", { live: true })
