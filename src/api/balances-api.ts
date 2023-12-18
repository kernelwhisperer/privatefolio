import { Balance, BalanceMap, Timestamp } from "../interfaces"
import { ProgressCallback } from "../stores/task-store"
import { countAuditLogs, findAuditLogs } from "./audit-logs-api"
import { getPricesForAsset } from "./daily-prices-api"
import { auditLogsDB, balancesDB } from "./database"
import { getValue, setValue } from "./kv-api"

export async function getLatestBalances(): Promise<Balance[]> {
  const balancesCursor = await getValue<Timestamp>("balancesCursor")

  try {
    const balanceMap = await balancesDB.get(String(balancesCursor))
    const { _id, _rev, timestamp, ...map } = balanceMap
    const balanceDocs = Object.keys(map).map((x) => ({ balance: map[x], symbol: x }))

    const balances = await Promise.all(
      balanceDocs.map(async (x) => {
        const prices = await getPricesForAsset(x.symbol, timestamp)
        const price = prices.length > 0 ? prices[0] : undefined

        return {
          _id: `${timestamp}_${x.symbol}`,
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

export async function getHistoricalBalances(symbol?: string, limit?: number) {
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
            // symbol: "desc",
            timestamp: "desc",
          }
        : { timestamp: "desc" },
    ],
  })

  return balances.docs.reverse()
}

const PAGE_SIZE = 1000

export async function computeBalances(progress: ProgressCallback, signal: AbortSignal) {
  // TODO cursor
  const count = await countAuditLogs()
  progress([0, `Computing balances from ${count} audit logs`])

  const latestBalances: BalanceMap = {
    _id: 0,
    timestamp: 0,
  }
  let historicalBalances: Record<number, BalanceMap> = {}

  for (let i = 0; i < count; i += PAGE_SIZE) {
    if (signal.aborted) {
      throw new Error(signal.reason)
    }

    const firstIndex = i + 1
    const lastIndex = Math.min(i + PAGE_SIZE, count)

    progress([(i * 100) / count, `Processing logs ${firstIndex} to ${lastIndex}`])
    const logs = await findAuditLogs({
      limit: PAGE_SIZE,
      order: "asc",
      skip: i,
    })
    // progress([(i * 100) / count, `Processing logs ${firstIndex} to ${lastIndex} - fetch complete`])

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
    // progress([
    //   (i * 100) / count,
    //   `Processing logs ${firstIndex} to ${lastIndex} - compute complete`,
    // ])
    await auditLogsDB.bulkDocs(logs)

    //
    // progress([
    //   (i * 100) / count,
    //   `Processing logs ${firstIndex} to ${lastIndex} - audit logs updated`,
    // ])

    const balancesIds = Object.keys(historicalBalances).map((x) => ({ id: x }))
    const { results: balancesDocs } = await balancesDB.bulkGet({ docs: balancesIds })

    // eslint-disable-next-line no-loop-func
    const balances: BalanceMap[] = balancesDocs.map((doc) => ({
      ...historicalBalances[doc.id],
      _id: doc.id,
      _rev: "ok" in doc.docs[0] ? doc.docs[0].ok._rev : undefined,
      timestamp: Number(doc.id),
    }))
    // console.log("ComputeBalances db results", balances)
    await balancesDB.bulkDocs(balances)
    await setValue("balancesCursor", latestDay)
    progress([
      ((i + PAGE_SIZE) * 100) / count,
      `Processing logs ${firstIndex} to ${lastIndex} complete`,
    ])

    // free memory, only keep last day
    historicalBalances = {
      [latestDay]: historicalBalances[latestDay],
    }
  }
}
