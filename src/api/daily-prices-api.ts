import { ResolutionString, SavedPrice, Timestamp } from "../interfaces"
import { mapToChartData, queryPrices } from "./binance-price-api"
import { dailyPricesDB } from "./database"

export async function getAssetPrices(symbol: string) {
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
  const explain = await (dailyPricesDB as any).explain({
    selector: { symbol, timestamp: { $exists: true } },
    sort: [{ timestamp: "asc" }],
  })
  console.log("📜 LOG > getAssetPrices > explain:", explain)

  const prices = await dailyPricesDB.find({
    selector: { symbol, timestamp: { $exists: true } },
    sort: [{ timestamp: "asc" }],
  })

  return prices.docs.map((x) => x.price)
}

export async function fetchAssetPrices() {
  // const symbols = $filterOptionsMap.get().symbol
  // console.log("Fetch daily asset prices:", symbols)
  const symbols = ["ETH"]
  const now = Date.now()
  const today = now - (now % 86400000)
  console.log("📜 LOG > fetchAssetPrices > today:", today)

  for (const symbol of symbols) {
    let since: Timestamp = 0
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

      if (results.length > 0) {
        since = results[results.length - 1][0]
      } else {
        since = today
      }
    }
  }
}
