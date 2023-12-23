import { ChartData, ResolutionString, SavedPrice, Time, Timestamp } from "../../interfaces"
import { ProgressCallback } from "../../stores/task-store"
import { formatDate } from "../../utils/formatting-utils"
import { core } from "../database"
import { mapToChartData, queryPrices } from "./binance-price-api"

export async function indexDailyPrices() {
  await core.dailyPricesDB.createIndex({
    index: {
      fields: ["timestamp"],
      name: "timestamp",
    },
  })
  await core.dailyPricesDB.createIndex({
    index: {
      fields: ["symbol", "timestamp"],
      name: "symbol",
    },
  })
}

export async function getPricesForAsset(symbol: string, timestamp?: Timestamp) {
  if (symbol === "USDT" && !!timestamp) {
    return [{ time: timestamp / 1000, value: 1 }] as ChartData[]
  }

  await indexDailyPrices()

  const _req: PouchDB.Find.FindRequest<SavedPrice> = {
    selector: { symbol, timestamp: timestamp || { $exists: true } },
    sort: [{ symbol: "asc", timestamp: "asc" }],
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
    fields: ["symbol", "price"],
    selector: { timestamp },
  }

  // console.log("📜 LOG > findTransactions > _req:", _req)
  // const explain = await (core.dailyPricesDB as any).explain(_req)
  // console.log("📜 LOG > findTransactions > explain:", explain.index)

  const prices = await core.dailyPricesDB.find(_req)

  return prices.docs.reduce(
    (map, x) => {
      map[x.symbol] = x.price
      return map
    },
    {
      USDT: { time: (timestamp / 1000) as Time, value: 1 },
    } as Record<string, ChartData>
  )
}

export async function getPriceCursor(symbol: string): Promise<Timestamp> {
  const prices = await core.dailyPricesDB.find({
    limit: 1,
    selector: { symbol, timestamp: { $exists: true } },
    sort: [{ symbol: "desc", timestamp: "desc" }],
  })

  if (prices.docs.length === 0) {
    return 0
  }

  return prices.docs[0].timestamp
}

export async function fetchDailyPrices(
  symbols: string[] | undefined,
  progress: ProgressCallback,
  signal: AbortSignal
) {
  if (!symbols) {
    throw new Error("No symbols provided") // TODO prevent this
  }
  progress([0, `Fetching asset prices for ${symbols.length} symbols`])
  await indexDailyPrices()

  const now = Date.now()
  const today: Timestamp = now - (now % 86400000)

  for (let i = 1; i <= symbols.length; i++) {
    const symbol = symbols[i - 1]

    if (signal.aborted) {
      throw new Error(signal.reason)
    }

    try {
      let since: Timestamp = await getPriceCursor(symbol)

      if (since === today) {
        progress([(i * 100) / symbols.length, `Skipping ${symbol}, already up to date`])
      }

      while (since !== today) {
        progress([
          (i * 100) / symbols.length,
          `Fetching ${symbol} from ${since !== 0 ? formatDate(since) : "genesis"}`,
        ])
        const pair = `${symbol}USDT`
        const source = "binance"

        const results = await queryPrices({
          pair,
          since,
          timeInterval: "1d" as ResolutionString,
        })

        const docs: SavedPrice[] = results.map((result) => ({
          _id: `${pair}-${source}-${result[0]}`,
          pair,
          price: mapToChartData(result),
          source,
          symbol,
          timestamp: result[0],
        }))

        core.dailyPricesDB.bulkDocs(docs)

        if (results.length > 1) {
          since = results[results.length - 1][0]
        } else {
          since = today
        }
      }
    } catch (error) {
      progress([(i * 100) / symbols.length, `Skipping ${symbol}: ${error}`])
    }
  }
}
