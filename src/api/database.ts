import PouchDB from "pouchdb"

export const fileImportsDB = new PouchDB("file-imports")
export const auditLogsDB = new PouchDB("audit-logs")
