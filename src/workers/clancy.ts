import { expose } from "comlink"

import * as auditLogs from "../api/audit-logs-api"
import * as balances from "../api/balances-api"
import * as dailyPrices from "../api/daily-prices-api"
import { auditLogsDB, resetDatabase } from "../api/database"
import * as fileImports from "../api/file-import-api"
import * as transactions from "../api/transactions-api"

const worker = {
  ...auditLogs,
  ...balances,
  async countAuditLogs() {
    const result = await auditLogsDB.allDocs({ include_docs: false, limit: 1 })
    return result.total_rows
  },
  ...dailyPrices,
  ...fileImports,
  ...resetDatabase,
  ...transactions,
}

export type Clancy = typeof worker

expose(worker)

console.log("WebWorker (Clancy) exposed")
