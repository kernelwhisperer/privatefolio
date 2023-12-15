import "./comlink-setup"

import { expose } from "comlink"

import * as auditLogs from "../api/audit-logs-api"
import * as balances from "../api/balances-api"
import * as dailyPrices from "../api/daily-prices-api"
import { resetDatabase } from "../api/database"
import * as fileImports from "../api/file-import-api"
import * as transactions from "../api/transactions-api"

const worker = {
  ...auditLogs,
  ...balances,
  ...dailyPrices,
  ...fileImports,
  resetDatabase,
  ...transactions,
}

export type Clancy = typeof worker

expose(worker)

console.log("WebWorker (Clancy) exposed")
