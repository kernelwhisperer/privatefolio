import { expose } from "comlink"

import { auditLogsDB } from "../api/database"
import { Clancy } from "../interfaces"

const obj: Clancy = {
  async countAuditLogs() {
    const result = await auditLogsDB.allDocs({ include_docs: false, limit: 1 })
    return result.total_rows
  },
  counter: 0,
}

expose(obj)

console.log("WebWorker (Clancy) exposed")
