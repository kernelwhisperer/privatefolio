import "./comlink-setup"

import { expose } from "comlink"

import * as auditLogs from "../api/audit-logs-api"
import * as balances from "../api/balances-api"
import * as connections from "../api/connections-api"
import * as dailyPrices from "../api/daily-prices-api"
import { resetDatabase } from "../api/database"
import * as fileImports from "../api/file-import-api"
import * as kv from "../api/kv-api"
import * as portfolio from "../api/portfolio-api"
import * as transactions from "../api/transactions-api"

const worker = {
  ...connections,
  ...auditLogs,
  ...balances,
  ...dailyPrices,
  ...fileImports,
  resetDatabase,
  ...transactions,
  ...kv,
  ...portfolio,
}

export type Clancy = typeof worker

expose(worker)

console.log("WebWorker (Clancy) exposed")
