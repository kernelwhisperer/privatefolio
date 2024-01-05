import { findAuditLogs } from "./audit-logs-api"
import { setValue } from "./kv-api"
import { findTransactions } from "./transactions-api"

export async function computeGenesis(accountName = "main") {
  const res = await findAuditLogs({ limit: 1, order: "asc" }, accountName)
  const genesis = res.length === 0 ? 0 : res[0].timestamp
  await setValue("genesis", genesis)
}

export async function computeLastTx(accountName = "main") {
  const res = await findTransactions({ limit: 1, order: "desc" }, accountName)
  const lastTx = res.length === 0 ? 0 : res[0].timestamp
  await setValue("lastTx", lastTx)
}
