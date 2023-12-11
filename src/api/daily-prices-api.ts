import { ResolutionString, SavedPrice, Timestamp } from "../interfaces"
import { $filterOptionsMap } from "../stores/metadata-store"
import { mapToChartData, queryPrices } from "./binance-price-api"
import { dailyPricesDB } from "./database"

export async function getAssetPrices(symbol: string, timestamp: Timestamp) {
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
  // const explain = await (dailyPricesDB as any).explain({
  //   selector: { symbol, timestamp: { $exists: true } },
  //   sort: [{ timestamp: "asc" }],
  // })
  // console.log("📜 LOG > getAssetPrices > explain:", explain)

  const prices = await dailyPricesDB.find({
    selector: { symbol, timestamp: timestamp || { $exists: true } },
    sort: [{ timestamp: "asc" }],
  })

  return prices.docs.map((x) => x.price)
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

export async function fetchAssetPrices() {
  const symbols = $filterOptionsMap.get().symbol
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
