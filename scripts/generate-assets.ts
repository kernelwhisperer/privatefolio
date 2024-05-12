import { mkdir, writeFile } from "fs/promises"
import { join } from "path"

import { COINGECKO_BASE_API } from "../src/api/external/assets/coingecko-asset-api"
import { AssetMetadata } from "../src/interfaces"
import { ASSET_FILES_LOCATION, PLATFORM_IDS, PlatformId, PLATFORMS_META } from "../src/settings"
import { isEvmPlatform } from "../src/utils/assets-utils"
import { wait } from "../src/utils/utils"

const PAGES = 4 // 250 * 4 = 1000
const DESTINATION_DIR = `/public/${ASSET_FILES_LOCATION}`
const API_KEY = "CG-vYui9UAExP3fuAH5sYv7D6Ch"

type CoingeckoId = string

/**
 * @example
 *
 * ```json
 * {
 *   "id": "usd-coin",
 *   "symbol": "usdc",
 *   "name": "USDC",
 *   "platforms": {
 *     "ethereum": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
 *     "polkadot": "1337",
 *     "avalanche": "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
 *     "optimistic-ethereum": "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
 *     "stellar": "USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
 *     "near-protocol": "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
 *     "hedera-hashgraph": "0.0.456858",
 *     "zksync": "0x1d17cbcf0d6d143135ae902365d2e5e2a16538d4",
 *     "tron": "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
 *     "arbitrum-one": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
 *     "base": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
 *     "polygon-pos": "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
 *     "solana": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
 *     "flow": "A.b19436aae4d94622.FiatToken",
 *     "celo": "0xceba9300f2b948710d2653dd7b07f33a8b32118c"
 *     }
 * }
 * ```
 */
type AssetWithPlatforms = {
  id: CoingeckoId
  name: string
  platforms: Record<string, string>
  symbol: string
}

async function getAssetMapWithPlatforms() {
  const params = new URLSearchParams({
    include_platform: "true",
  })

  const url = `${COINGECKO_BASE_API}/coins/list?${params}`
  const response = await fetch(url)

  const list = (await response.json()) as AssetWithPlatforms[]
  const map: Record<CoingeckoId, AssetWithPlatforms> = list.reduce((acc, x) => {
    acc[x.id] = x
    return acc
  }, {})

  return map
}

/**
 * @example
 * ```json
 * {
 *   "id": "bitcoin",
 *   "symbol": "btc",
 *   "name": "Bitcoin",
 *   "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
 *   "current_price": 36295,
 *   "market_cap": 708951941289,
 *   "market_cap_rank": 1,
 *   "fully_diluted_valuation": 761843156368,
 *   "total_volume": 16970655279,
 *   "high_24h": 36989,
 *   "low_24h": 36223,
 *   "price_change_24h": -626.6685457503772,
 *   "price_change_percentage_24h": -1.69731,
 *   "market_cap_change_24h": -11020124835.994995,
 *   "market_cap_change_percentage_24h": -1.53063,
 *   "circulating_supply": 19542068,
 *   "total_supply": 21000000,
 *   "max_supply": 21000000,
 *   "ath": 69045,
 *   "ath_change_percentage": -47.45403,
 *   "ath_date": "2021-11-10T14:24:11.849Z",
 *   "atl": 67.81,
 *   "atl_change_percentage": 53403.58354,
 *   "atl_date": "2013-07-06T00:00:00.000Z",
 *   "roi": null,
 *   "last_updated": "2023-11-14T12:46:54.888Z"
 * }
 */
type AssetWithMeta = {
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  circulating_supply: number
  current_price: number
  high_24h: number
  id: CoingeckoId
  image: string
  last_updated: string
  low_24h: number
  market_cap: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  market_cap_rank: number
  max_supply: number
  name: string
  price_change_24h: number
  price_change_percentage_24h: number
  roi: null
  symbol: string
  total_supply: number
  total_volume: number
}

const EVM_PLATFORMS: PlatformId[] = PLATFORM_IDS.filter(isEvmPlatform)

async function main() {
  const map = await getAssetMapWithPlatforms()

  const params = new URLSearchParams({
    order: "market_cap_desc",
    per_page: "250", // max
    vs_currency: "usd",
    x_cg_demo_api_key: API_KEY,
  })

  const URLs = Array(PAGES)
    .fill(null)
    .map((_, index) => `${COINGECKO_BASE_API}/coins/markets?${params}&page=${index + 1}`)
  console.log("URLs:", URLs)

  const destination = join(process.cwd(), DESTINATION_DIR)
  for (const platform of EVM_PLATFORMS) {
    await mkdir(`${destination}/${platform}`, { recursive: true })
  }
  await mkdir(`${destination}/symbol`, { recursive: true })
  await mkdir(`${destination}/meta`, { recursive: true })

  await Promise.all(
    URLs.map(async (url, index) => {
      try {
        // await wait(1500 * (index % 10))
        await wait(500 * index)

        const res = await fetch(url)
        const list = await res.json()

        if (list?.status?.error_message) {
          throw new Error(list.status.error_message)
        }

        const assets = (list as AssetWithMeta[]).map((x) => {
          const symbol = x.symbol.toUpperCase()

          const asset: AssetMetadata = {
            coingeckoId: x.id,
            logoUrl: x.image,
            // isStablecoin: ["USD", "EUR", "USDT", "USDC"].includes(symbol),
            name: x.name,
            symbol,
          }

          return asset
        })

        for (const asset of assets) {
          if (!asset.coingeckoId) return
          const { platforms } = map[asset.coingeckoId]

          for (const platform of EVM_PLATFORMS) {
            const contractAddress = platforms[PLATFORMS_META[platform].coingeckoId as string]

            if (contractAddress) {
              await writeFile(`${destination}/${platform}/${contractAddress}`, asset.coingeckoId)
            }
          }
          await writeFile(`${destination}/symbol/${asset.symbol}`, asset.coingeckoId)
          await writeFile(
            `${destination}/meta/${asset.coingeckoId}`,
            JSON.stringify({
              logoUrl: asset.logoUrl,
              name: asset.name,
            })
          )
        }

        console.log(`Page ${index + 1} processed`)
      } catch (error) {
        console.error(`Page ${index + 1} failed: ${String(error)}`)
      }
    })
  )

  return "Success"
}

main().then(console.log).catch(console.error)

//  // As per DESIGN.md, coingecko rate limits are 30 requests per minute
//  const meta = await backOff(() => getAssetMetaByContract(contract, platform), {
//   maxDelay: 60_000,
//   retry: (err) => {
//     if (err instanceof Error && err.message !== "429: Rate limited") {
//       return false
//     }
//     progress([undefined, "Rate limited, retrying..."])
//     if (signal?.aborted) {
//       return false
//     }
//     return true
//   },
//   startingDelay: 2_000,
// })
// if (signal?.aborted) {
//   throw new Error(signal.reason)
// }
