import { noop } from "src/utils/utils"

import { Balance, BalanceMap, Timestamp } from "../../interfaces"
import { DB_OPERATION_PAGE_SIZE } from "../../settings"
import { ProgressCallback } from "../../stores/task-store"
import { getPricesForAsset } from "../core/daily-prices-api"
import { getAccount } from "../database"
import { countAuditLogs, findAuditLogs } from "./audit-logs-api"
import { getValue, setValue } from "./kv-api"

export async function getLatestBalances(accountName = "main"): Promise<Balance[]> {
  const account = getAccount(accountName)
  const balancesCursor = await getValue<Timestamp>("balancesCursor", undefined, accountName)

  try {
    const balanceMap = await account.balancesDB.get(String(balancesCursor))
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
  } catch (error) {
    console.log("📜 LOG > getLatestBalances > error:", error)
    return []
  }
}

export type GetHistoricalBalancesRequest = {
  accountName: string
  limit?: number
  symbol?: string
}

export async function getHistoricalBalances(request: GetHistoricalBalancesRequest) {
  const { symbol, limit, accountName = "main" } = request
  const account = getAccount(accountName)
  await account.balancesDB.createIndex({
    index: {
      fields: ["timestamp"],
      name: "timestamp",
    },
  })
  const balances = await account.balancesDB.find({
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
            // symbol: "desc", TODO TESTME
            timestamp: "desc",
          }
        : { timestamp: "desc" },
    ],
  })

  return balances.docs.reverse()
}

export type ComputeBalancesRequest = {
  accountName?: string
  pageSize?: number
  progress?: ProgressCallback
  signal?: AbortSignal
  until?: Timestamp
}

export async function computeBalances(request: ComputeBalancesRequest) {
  const {
    progress = noop,
    signal,
    pageSize = DB_OPERATION_PAGE_SIZE,
    until = Date.now(),
    accountName = "main",
  } = request

  const account = getAccount(accountName)
  // TODO cursor
  const count = await countAuditLogs(accountName)
  progress([0, `Computing balances from ${count} audit logs`])

  const latestBalances: BalanceMap = {
    _id: 0,
    timestamp: 0,
  }
  let historicalBalances: Record<number, BalanceMap> = {}

  let latestDay = 0

  for (let i = 0; i < count; i += pageSize) {
    if (signal?.aborted) {
      throw new Error(signal.reason)
    }

    const firstIndex = i + 1
    const lastIndex = Math.min(i + pageSize, count)

    progress([(i * 90) / count, `Processing logs ${firstIndex} to ${lastIndex}`])
    const logs = await findAuditLogs(
      {
        limit: pageSize,
        order: "asc",
        skip: i,
      },
      accountName
    )

    // progress([(i * 100) / count, `Processing logs ${firstIndex} to ${lastIndex} - fetch complete`])
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
      latestBalances.timestamp = nextDay

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
    await account.auditLogsDB.bulkDocs(logs)

    //
    // progress([
    //   (i * 100) / count,
    //   `Processing logs ${firstIndex} to ${lastIndex} - audit logs updated`,
    // ])

    const balancesIds = Object.keys(historicalBalances).map((x) => ({ id: x }))
    const { results: balancesDocs } = await account.balancesDB.bulkGet({ docs: balancesIds })

    // eslint-disable-next-line no-loop-func
    const balances: BalanceMap[] = balancesDocs.map((doc) => ({
      ...historicalBalances[doc.id],
      _id: doc.id,
      _rev: "ok" in doc.docs[0] ? doc.docs[0].ok._rev : undefined,
      timestamp: Number(doc.id),
    }))
    // console.log("ComputeBalances db results", balances)
    await account.balancesDB.bulkDocs(balances)
    await setValue("balancesCursor", latestDay, accountName)
    progress([
      ((i + pageSize) * 90) / Math.max(count, pageSize),
      `Processing logs ${firstIndex} to ${lastIndex} complete`,
    ])

    // free memory, only keep last day
    historicalBalances = {
      [latestDay]: historicalBalances[latestDay],
    }
  }

  if (latestDay === 0) return

  progress([95, `Filling the balances to reach today`])
  // The balances remain the same until today
  for (let i = latestDay + 86400000; i <= until; i += 86400000) {
    historicalBalances[i] = latestBalances
    latestDay = i
  }
  const balancesIds = Object.keys(historicalBalances).map((x) => ({ id: x }))
  const { results: balancesDocs } = await account.balancesDB.bulkGet({ docs: balancesIds })
  // eslint-disable-next-line no-loop-func
  const balances: BalanceMap[] = balancesDocs.map((doc) => ({
    ...historicalBalances[doc.id],
    _id: doc.id,
    _rev: "ok" in doc.docs[0] ? doc.docs[0].ok._rev : undefined,
    timestamp: Number(doc.id),
  }))
  await account.balancesDB.bulkDocs(balances)
  await setValue("balancesCursor", latestDay, accountName)
  progress([100, `Computed all balances!`])
}
