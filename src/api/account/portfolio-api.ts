import { findAuditLogs } from "./audit-logs-api"
import { setValue } from "./kv-api"
import { findTransactions } from "./transactions-api"

export async function computeGenesis() {
  const res = await findAuditLogs({ limit: 1, order: "asc" })
  const genesis = res.length === 0 ? 0 : res[0].timestamp
  await setValue("genesis", genesis)
}

export async function computeLastTx() {
  const res = await findTransactions({ limit: 1, order: "desc" })
  const lastTx = res.length === 0 ? 0 : res[0].timestamp
  await setValue("lastTx", lastTx)
}
