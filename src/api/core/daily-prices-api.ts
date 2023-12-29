import {
  ChartData,
  PriceApiId,
  ResolutionString,
  SavedPrice,
  Time,
  Timestamp,
} from "src/interfaces"
import { PRICE_API_PAGINATION } from "src/settings"
import { ProgressCallback } from "src/stores/task-store"
import { formatDate } from "src/utils/formatting-utils"
import { noop } from "src/utils/utils"

import { core } from "../database"
import { PAIR_MAPPER, PRICE_APIS, PRICE_MAPPER } from "./prices/providers"

export async function indexDailyPrices() {
  await core.dailyPricesDB.createIndex({
    index: {
      fields: ["timestamp"],
      name: "timestamp",
    },
  })
  await core.dailyPricesDB.createIndex({
    index: {
      fields: ["symbol", "source", "timestamp"],
      name: "symbol",
    },
  })
}

export async function getPricesForAsset(
  symbol: string,
  source = "coinbase",
  timestamp?: Timestamp
) {
  if (symbol === "USDT" && !!timestamp) {
    return [{ time: timestamp / 1000, value: 1 }] as ChartData[]
  }

  await indexDailyPrices()

  const _req: PouchDB.Find.FindRequest<SavedPrice> = {
    selector: {
      symbol,
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      source,
      timestamp: timestamp || { $exists: true },
    },
    sort: [
      {
        //
        symbol: "asc",
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        source: "asc",
        timestamp: "asc",
      },
    ],
  }

  // console.log("📜 LOG > findTransactions > _req:", _req)
  // const explain = await (core.dailyPricesDB as any).explain(_req)
  // console.log("📜 LOG > findTransactions > explain:", explain.index)

  const prices = await core.dailyPricesDB.find(_req)

  return prices.docs.map((x) => x.price)
}

export async function getAssetPriceMap(timestamp: Timestamp) {
  await indexDailyPrices()

  const _req: PouchDB.Find.FindRequest<SavedPrice> = {
    fields: ["symbol", "price", "source"],
    selector: { timestamp },
  }

  // console.log("📜 LOG > findTransactions > _req:", _req)
  // const explain = await (core.dailyPricesDB as any).explain(_req)
  // console.log("📜 LOG > findTransactions > explain:", explain.index)

  const prices = await core.dailyPricesDB.find(_req)

  return prices.docs.reduce(
    (map, x) => {
      console.log("📜 LOG > getAssetPriceMap > x:", x)
      map[x.symbol] = x.price
      return map
    },
    {
      USDT: { time: (timestamp / 1000) as Time, value: 1 },
    } as Record<string, ChartData>
  )
}

export async function getPriceCursor(
  symbol: string,
  source: PriceApiId
): Promise<Timestamp | undefined> {
  const prices = await core.dailyPricesDB.find({
    limit: 1,
    selector: {
      symbol,
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      source,
      timestamp: { $exists: true },
    },
    sort: [
      {
        symbol: "desc",
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        source: "desc",
        timestamp: "desc",
      },
    ],
  })

  if (prices.docs.length === 0) {
    return undefined
  }

  return prices.docs[0].timestamp
}

type FetchDailyPricesRequest = {
  apiPreference?: PriceApiId
  symbols?: string[]
}

export async function fetchDailyPrices(
  request: FetchDailyPricesRequest,
  progress: ProgressCallback = noop,
  signal?: AbortSignal
) {
  const { symbols, apiPreference = "coinbase" } = request

  if (!symbols) {
    throw new Error("No symbols provided") // TODO prevent this
  }

  progress([0, `Fetching asset prices for ${symbols.length} symbols`])
  await indexDailyPrices()

  const now = Date.now()
  const today: Timestamp = now - (now % 86400000)

  const priceApi = PRICE_APIS[apiPreference]
  const priceMapper = PRICE_MAPPER[apiPreference]
  const pairMapper = PAIR_MAPPER[apiPreference]

  if (!priceApi || !priceMapper || !pairMapper) {
    throw new Error(`Price api ${apiPreference} is not supported`)
  }

  for (let i = 1; i <= symbols.length; i++) {
    const symbol = symbols[i - 1]

    if (signal?.aborted) {
      throw new Error(signal.reason)
    }

    try {
      let since: Timestamp | undefined = await getPriceCursor(symbol, apiPreference)
      let until: Timestamp | undefined = today

      if (!since) since = today - 86400000 * PRICE_API_PAGINATION

      while (true) {
        const pair = pairMapper(symbol)
        const source = apiPreference

        const results = await priceApi({
          limit: PRICE_API_PAGINATION,
          pair,
          since,
          timeInterval: "1d" as ResolutionString,
          until,
        })

        const docIds: Array<{ id: string }> = []

        const documentMap = results.reduce((acc, result) => {
          const price = priceMapper(result)
          const timestamp = (price.time as number) * 1000
          const _id = `${pair}-${source}-${timestamp}`

          acc[_id] = {
            _id,
            pair,
            price,
            source,
            symbol,
            timestamp,
          }

          docIds.push({ id: _id })
          return acc
        }, {} as Record<string, SavedPrice>)

        const { results: docsWithRevision } = await core.dailyPricesDB.bulkGet({ docs: docIds })

        const docs: SavedPrice[] = docsWithRevision.map((x) => ({
          ...documentMap[x.id],
          _rev: "ok" in x.docs[0] ? x.docs[0].ok._rev : undefined,
        }))

        // const dbReceipts =
        await core.dailyPricesDB.bulkDocs(docs)
        // console.log(
        //   "📜 LOG > dbReceipts:",
        //   dbReceipts.find((x) => !x.rev?.includes("1-"))
        // )

        const start = (priceMapper(results[0]).time as number) * 1000
        const end = (priceMapper(results[results.length - 1]).time as number) * 1000

        progress([
          (i * 100) / symbols.length,
          `Fetched ${symbol} from ${formatDate(start)} to ${formatDate(end)}`,
        ])

        if (results.length !== PRICE_API_PAGINATION) {
          // reached listing date (genesis)
          break
        }

        until = start - 86400000
        since = start - 86400000 * PRICE_API_PAGINATION
      }
    } catch (error) {
      progress([(i * 100) / symbols.length, `Skipped ${symbol}: ${error}`])
    }
  }
}
