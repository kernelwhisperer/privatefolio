import { Balance, BalanceMap } from "../interfaces"
import { findAuditLogs } from "./audit-logs-api"
import { getPricesForAsset } from "./daily-prices-api"
import { auditLogsDB, balancesDB } from "./database"
import { getValue, setValue } from "./kv-api"

export async function getLatestBalances(): Promise<Balance[]> {
  const balancesCursor = await getValue("balancesCursor")

  try {
    const balanceMap = await balancesDB.get(String(balancesCursor))
    const { _id, _rev, timestamp, ...map } = balanceMap
    const balanceDocs = Object.keys(map).map((x) => ({ balance: map[x], symbol: x }))

    const balances = await Promise.all(
      balanceDocs.map(async (x) => {
        const prices = await getPricesForAsset(x.symbol, timestamp)
        const price = prices.length > 0 ? prices[0] : undefined

        return {
          ...x,
          price,
          value: price ? price.value * x.balance : undefined,
        }
      })
    )
    return balances
  } catch {
    return []
  }
}

export async function getHistoricalBalances(symbol?: string, limit = 300) {
  await balancesDB.createIndex({
    index: {
      fields: ["timestamp"],
      name: "timestamp",
    },
  })
  const balances = await balancesDB.find({
    fields: symbol ? [symbol, "timestamp"] : undefined,
    limit,
    selector: symbol
      ? {
          [symbol]: { $exists: true },
          timestamp: { $exists: true },
        }
      : {
          timestamp: { $exists: true },
        },
    sort: [
      symbol
        ? {
            symbol: "desc",
            timestamp: "desc",
          }
        : { timestamp: "desc" },
    ],
  })

  return balances.docs.reverse()
}

export async function computeBalances(symbol?: string) {
  const { length: count } = await findAuditLogs({ fields: [], filters: { symbol } })
  console.log("Recompute balances total logs:", count)

  const latestBalances: BalanceMap = {
    _id: 0,
    timestamp: 0,
  }
  let historicalBalances: Record<number, BalanceMap> = {}

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

    let latestDay = 0

    for (const log of logs) {
      const { symbol, changeN, timestamp } = log

      const nextDay = timestamp - (timestamp % 86400000)

      // fill the daily gaps
      if (latestDay !== 0) {
        const daysDiff = (nextDay - latestDay) / 86400000
        if (daysDiff > 1) {
          for (let i = 1; i < daysDiff; i++) {
            const gapDay = latestDay + i * 86400000
            historicalBalances[gapDay] = Object.assign({}, latestBalances)
          }
        }
      }

      // update balance
      if (!latestBalances[symbol]) {
        latestBalances[symbol] = 0
      }
      latestBalances[symbol] += changeN

      // update audit log
      log.balance = latestBalances[symbol]

      // update historical balances
      if (!historicalBalances[nextDay]) {
        historicalBalances[nextDay] = Object.assign({}, latestBalances)
      } else {
        historicalBalances[nextDay][symbol] = latestBalances[symbol]
      }

      latestDay = nextDay
    }
    console.log("Recompute balances processing logs from", i, "to", i + 500, "compute completed")
    await auditLogsDB.bulkDocs(logs)

    //
    console.log("Recompute balances processing logs from", i, "to", i + 500, "audit logs saved")
    const balancesIds = Object.keys(historicalBalances).map((x) => ({ id: x }))
    const { results: balancesDocs } = await balancesDB.bulkGet({ docs: balancesIds })
    console.log("📜 LOG > computeBalances > balancesDocs:", balancesDocs)

    // eslint-disable-next-line no-loop-func
    const balances: BalanceMap[] = balancesDocs.map((doc) => ({
      ...historicalBalances[doc.id],
      _id: doc.id,
      _rev: "ok" in doc.docs[0] ? doc.docs[0].ok._rev : undefined,
      timestamp: Number(doc.id),
    }))
    console.log("📜 LOG > constbalances:BalanceMap[]=Object.keys > balances:", balances)
    await balancesDB.bulkDocs(balances)
    await setValue("balancesCursor", latestDay)
    console.log("Recompute balances processing logs from", i, "to", i + 500, "balances saved")

    // free memory, only keep last day
    historicalBalances = {
      [latestDay]: historicalBalances[latestDay],
    }
  }
}
