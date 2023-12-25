import { mkdir, writeFile } from "fs/promises"
import { join } from "path"

import { Exchange } from "../src/interfaces"
import { EXCHANGE_FILES_LOCATION, EXCHANGE_PAGES } from "../src/settings"

const COINGECKO_BASE_API = "https://api.coingecko.com/api/v3"
const ENDPOINT = "exchanges"
const PAGES = EXCHANGE_PAGES
const DESTINATION_DIR = `/public/${EXCHANGE_FILES_LOCATION}`

async function main() {
  const URLs = Array(PAGES)
    .fill(null)
    .map((_, index) => `${COINGECKO_BASE_API}/${ENDPOINT}?per_page=100&page=${index + 1}`)
  console.log("URLs:", URLs)

  const destination = join(process.cwd(), DESTINATION_DIR)
  await mkdir(destination, { recursive: true })

  await Promise.all(
    URLs.map(async (url, index) => {
      const res = await fetch(url)
      const list: unknown[] = await res.json()

      // "id": "binance",
      // "name": "Binance",
      // "year_established": 2017,
      // "country": "Cayman Islands",
      // "description": "",
      // "url": "https://www.binance.com/",
      // "image": "https://assets.coingecko.com/markets/images/52/small/binance.jpg?1519353250",
      // "has_trading_incentive": false,
      // "trust_score": 10,
      // "trust_score_rank": 1,
      // "trade_volume_24h_btc": 366988.3257231297,
      // "trade_volume_24h_btc_normalized": 206973.362430161
      const exchanges: Exchange[] = list.map((x: any) => ({
        coingeckoId: x.id,
        coingeckoTrustScore: x.trust_score,
        coingeckoTrustScoreRank: x.trust_score_rank,
        country: x.country,
        image: x.image,
        name: x.name,
        url: x.url,
        year: x.year_established,
      }))

      await writeFile(`${destination}/page-${index + 1}.json`, JSON.stringify(exchanges, null, 2))

      console.log(`Page ${index + 1} written`)
    })
  )

  return "Success"
}

main().then(console.log).catch(console.error)
