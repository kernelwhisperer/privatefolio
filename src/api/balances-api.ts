import { findAuditLogs } from "./audit-logs-api"
import { auditLogsDB, balancesDB } from "./database"

export async function getBalances() {
  return balancesDB.get("balances")
}

export async function computeBalances(symbol?: string) {
  const { length: count } = await findAuditLogs({ fields: [], filters: { symbol } })
  console.log("Recompute balances total logs:", count)

  const balances: Record<string, number> = {}
  for (let i = 0; i < count; i += 500) {
    console.log("Recompute balances processing logs from", i, "to", i + 500)
    const logs = await findAuditLogs({
      filters: { symbol },
      limit: 500,
      order: "asc",
      skip: i,
    })
    console.log(
      "Recompute balances processing logs from",
      i,
      "to",
      i + 500,
      "fetch completed",
      logs
    )
    for (const log of logs) {
      const { symbol, changeN } = log

      if (!balances[symbol]) balances[symbol] = 0
      balances[symbol] += changeN

      log.balance = balances[symbol]
    }
    console.log("Recompute balances processing logs from", i, "to", i + 500, "compute completed")
    await auditLogsDB.bulkDocs(logs)
    console.log("Recompute balances processing logs from", i, "to", i + 500, "save completed")
  }

  // update balancesDB
  const existing = await balancesDB.get("balances")
  if (!existing) {
    balancesDB.put({ _id: "balances", map: balances, timestamp: Date.now() })
    return
  }

  if (symbol) {
    existing.map[symbol] = balances[symbol]
  } else {
    existing.map = balances
  }
  existing.timestamp = Date.now()

  balancesDB.put(existing)
}
