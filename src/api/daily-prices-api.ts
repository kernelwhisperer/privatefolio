import { ChartData, ResolutionString, SavedPrice, Time, Timestamp } from "../interfaces"
import { FilterOptionsMap } from "../stores/metadata-store"
import { mapToChartData, queryPrices } from "./binance-price-api"
import { dailyPricesDB } from "./database"

export async function indexDailyPrices() {
  await dailyPricesDB.createIndex({
    index: {
      fields: ["timestamp"],
      name: "timestamp",
    },
  })
  await dailyPricesDB.createIndex({
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
  // const explain = await (dailyPricesDB as any).explain(_req)
  // console.log("📜 LOG > findTransactions > explain:", explain.index)

  const prices = await dailyPricesDB.find(_req)

  return prices.docs.map((x) => x.price)
}

export async function getAssetPriceMap(timestamp: Timestamp) {
  await indexDailyPrices()

  const _req: PouchDB.Find.FindRequest<SavedPrice> = {
    fields: ["symbol", "price"],
    selector: { timestamp },
  }

  // console.log("📜 LOG > findTransactions > _req:", _req)
  // const explain = await (dailyPricesDB as any).explain(_req)
  // console.log("📜 LOG > findTransactions > explain:", explain.index)

  const prices = await dailyPricesDB.find(_req)

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
  const prices = await dailyPricesDB.find({
    limit: 1,
    selector: { symbol, timestamp: { $exists: true } },
    sort: [{ timestamp: "desc" }],
  })

  if (prices.docs.length === 0) {
    return 0
  }

  return prices.docs[0].timestamp
}

export async function fetchAssetPrices(filterMap: FilterOptionsMap) {
  const symbols = filterMap.symbol
  console.log("Fetch daily asset prices:", symbols)
  const now = Date.now()
  const today: Timestamp = now - (now % 86400000)
  console.log("📜 LOG > fetchAssetPrices > today:", today)

  for (const symbol of symbols) {
    try {
      let since: Timestamp = await getPriceCursor(symbol)

      while (since !== today) {
        console.log("Fetching daily asset prices:", symbol, since)
        const pair = `${symbol}USDT`
        const source = "binance"

        const results = await queryPrices({
          limit: 300,
          pair,
          since,
          timeInterval: "1d" as ResolutionString,
        })
        console.log("Fetched daily asset prices:", symbol, since, results)

        const docs: SavedPrice[] = results.map((result) => ({
          _id: `${pair}-${source}-${result[0]}`,
          pair,
          price: mapToChartData(result),
          source,
          symbol,
          timestamp: result[0],
        }))

        dailyPricesDB.bulkDocs(docs)
        console.log("Saved daily asset prices:", docs)

        if (results.length > 1) {
          since = results[results.length - 1][0]
        } else {
          since = today
        }
      }
    } catch (error) {
      console.log("Failed to fetch daily asset prices:", symbol)
    }
  }
}
