import { mkdir, writeFile } from "fs/promises"
import { join } from "path"

import { Asset } from "../src/interfaces"
import { ASSET_FILES_LOCATION, ASSET_PAGES } from "../src/settings"

const COINGECKO_BASE_API = "https://api.coingecko.com/api/v3"
const ENDPOINT = "coins/markets"
const PAGES = ASSET_PAGES
const DESTINATION_DIR = `/public/${ASSET_FILES_LOCATION}`

async function main() {
  const URLs = Array(PAGES)
    .fill(null)
    .map(
      (_, index) =>
        `${COINGECKO_BASE_API}/${ENDPOINT}?vs_currency=usd&order=market_cap_desc&per_page=100&page=${
          index + 1
        }`
    )
  console.log("URLs:", URLs)

  const destination = join(process.cwd(), DESTINATION_DIR)
  await mkdir(destination, { recursive: true })

  await Promise.all(
    URLs.map(async (url, index) => {
      const res = await fetch(url)
      const list: unknown[] = await res.json()

      // "id": "bitcoin",
      // "symbol": "btc",
      // "name": "Bitcoin",
      // "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
      // "current_price": 36295,
      // "market_cap": 708951941289,
      // "market_cap_rank": 1,
      // "fully_diluted_valuation": 761843156368,
      // "total_volume": 16970655279,
      // "high_24h": 36989,
      // "low_24h": 36223,
      // "price_change_24h": -626.6685457503772,
      // "price_change_percentage_24h": -1.69731,
      // "market_cap_change_24h": -11020124835.994995,
      // "market_cap_change_percentage_24h": -1.53063,
      // "circulating_supply": 19542068,
      // "total_supply": 21000000,
      // "max_supply": 21000000,
      // "ath": 69045,
      // "ath_change_percentage": -47.45403,
      // "ath_date": "2021-11-10T14:24:11.849Z",
      // "atl": 67.81,
      // "atl_change_percentage": 53403.58354,
      // "atl_date": "2013-07-06T00:00:00.000Z",
      // "roi": null,
      // "last_updated": "2023-11-14T12:46:54.888Z"
      const assets: Asset[] = list.map((x: any) => ({
        coingeckoId: x.id,
        image: x.image,
        name: x.name,
        symbol: x.symbol.toUpperCase(),
      }))

      await writeFile(`${destination}/page-${index + 1}.json`, JSON.stringify(assets, null, 2))

      console.log(`Page ${index + 1} written`)
    })
  )

  return "Success"
}

main().then(console.log).catch(console.error)
