import { getAuditLogs } from "./audit-logs-api"
import { auditLogsDB } from "./database"

export interface Balance {
  balance: number
  symbol: string
  timestamp: number
  // wallet: string
}

export async function getBalances() {
  const res = await auditLogsDB.allDocs<Balance>({
    // attachments: true,
    // descending: true,
    include_docs: true,
  })
  return res.rows.map((row) => row.doc).filter((x) => x?.symbol === "ETH") as Balance[]
}

export async function computeBalances() {
  const logs = await getAuditLogs()
  logs.sort((a, b) => a.timestamp - b.timestamp)

  const map: Record<string, Record<number, number>> = {}
  const currentBalances: Record<string, number> = {}

  for (const log of logs) {
    const { symbol, changeN, timestamp } = log

    if (!map[symbol]) map[symbol] = {}
    if (!currentBalances[symbol]) currentBalances[symbol] = 0

    currentBalances[symbol] += changeN
    map[symbol][timestamp] = currentBalances[symbol]
  }

  return map
}
