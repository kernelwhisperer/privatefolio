import { formatDate } from "src/utils/formatting-utils"
import { noop } from "src/utils/utils"

import { Balance, BalanceMap, Timestamp } from "../../interfaces"
import { DB_OPERATION_PAGE_SIZE } from "../../settings"
import { ProgressCallback } from "../../stores/task-store"
import { getPricesForAsset } from "../core/daily-prices-api"
import { getAccount } from "../database"
import { validateOperation } from "../database-utils"
import { countAuditLogs, indexAuditLogs } from "./audit-logs-api"
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
        const prices = await getPricesForAsset(x.symbol, undefined, timestamp)
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
    console.error(error)
    return []
  }
}

export type GetHistoricalBalancesRequest = {
  accountName?: string
  limit?: number
  skip?: number
  symbol?: string
}

export async function getHistoricalBalances(request: GetHistoricalBalancesRequest) {
  const { symbol, limit, skip, accountName = "main" } = request
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
    skip,
    sort: [
      symbol
        ? {
            // symbol: "desc", TODO TESTME
            timestamp: "asc",
          }
        : { timestamp: "asc" },
    ],
  })

  return balances.docs
}

export type ComputeBalancesRequest = {
  pageSize?: number
  since?: Timestamp
  until?: Timestamp
}

export async function computeBalances(
  progress: ProgressCallback = noop,
  signal?: AbortSignal,
  request: ComputeBalancesRequest = {},
  accountName = "main"
) {
  const { pageSize = DB_OPERATION_PAGE_SIZE, until = Date.now() } = request
  let since = request.since

  const account = getAccount(accountName)
  if (since === undefined) {
    since = (await getValue<Timestamp>("balancesCursor", 0, accountName)) as Timestamp
  }

  if (since !== 0) {
    progress([0, `Refreshing balances starting ${formatDate(since)}`])
  }

  const { indexes } = await account.auditLogsDB.getIndexes()
  if (indexes.length === 1) {
    await indexAuditLogs(undefined, accountName)
  }

  const count =
    since === 0
      ? await countAuditLogs(accountName)
      : (await account.auditLogsDB.find({ selector: { timestamp: { $gte: since } } })).docs.length
  progress([0, `Computing balances for ${count} audit logs`])

  let recordsLength = 0
  let latestBalances: BalanceMap = {
    _id: 0,
    timestamp: 0,
  }
  if (since !== 0) {
    const latestBalancesDoc = await account.balancesDB.get(String(since - 86400000))
    const { _id, _rev, ...latestBalancesMap } = latestBalancesDoc
    latestBalances = latestBalancesMap
  }

  let historicalBalances: Record<number, BalanceMap> = {}

  let latestDay: Timestamp = 0

  for (let i = 0; i < count; i += pageSize) {
    if (signal?.aborted) {
      throw new Error(signal.reason)
    }

    const firstIndex = i + 1
    const lastIndex = Math.min(i + pageSize, count)

    progress([(i * 90) / count, `Processing logs ${firstIndex} to ${lastIndex}`])
    const { docs: logs } = await account.auditLogsDB.find({
      limit: pageSize,
      selector: { timestamp: { $gte: since } },
      skip: i,
      sort: [{ timestamp: "asc" }],
    })

    // progress([(i * 100) / count, `Processing logs ${firstIndex} to ${lastIndex} - fetch complete`])
    for (const log of logs) {
      const { symbol, changeN, timestamp } = log

      const nextDay: Timestamp = timestamp - (timestamp % 86400000)

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
    const logUpdates = await account.auditLogsDB.bulkDocs(logs)
    validateOperation(logUpdates)

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
    recordsLength += balances.length
    const balanceUpdates = await account.balancesDB.bulkDocs(balances)
    validateOperation(balanceUpdates)

    await setValue("balancesCursor", latestDay, accountName)
    progress([
      ((i + pageSize) * 90) / Math.max(count, pageSize),
      `Processing logs ${firstIndex} to ${lastIndex} complete`,
    ])
    progress([
      ((i + pageSize) * 90) / Math.max(count, pageSize),
      `Processed ${balances.length} daily balances`,
    ])

    // free memory
    historicalBalances = {}
  }

  if (latestDay === 0) return

  // The balances remain the same until today
  progress([95, `Filling balances to reach today`])
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
  const balanceUpdates = await account.balancesDB.bulkDocs(balances)
  validateOperation(balanceUpdates)

  await setValue("balancesCursor", latestDay, accountName)
  recordsLength += balances.length
  progress([100, `Saved ${recordsLength} records to disk`])
}
