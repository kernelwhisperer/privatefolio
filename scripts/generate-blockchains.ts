import { mkdir, writeFile } from "fs/promises"
import { join } from "path"

import { Blockchain } from "../src/interfaces"
import { BLOCKCHAIN_FILES_LOCATION, BLOCKCHAIN_PAGES } from "../src/settings"

const COINGECKO_BASE_API = "https://api.coingecko.com/api/v3"
const ENDPOINT = "asset_platforms"
const PAGES = BLOCKCHAIN_PAGES
const DESTINATION_DIR = `/public/${BLOCKCHAIN_FILES_LOCATION}`

async function main() {
  const URLs = Array(PAGES)
    .fill(null)
    .map((_, index) => `${COINGECKO_BASE_API}/${ENDPOINT}?per_page=1000&page=${index + 1}`) // this endpoint doesn't have pagination
  console.log("URLs:", URLs)

  const destination = join(process.cwd(), DESTINATION_DIR)
  await mkdir(destination, { recursive: true })

  await Promise.all(
    URLs.map(async (url, index) => {
      const res = await fetch(url)
      const list: unknown[] = await res.json()

      // "id": "polygon-pos",
      // "chain_identifier": 137,
      // "name": "Polygon POS",
      // "shortname": "MATIC",
      // "native_coin_id": "matic-network"
      const chains: Blockchain[] = list
        .filter((x: any) => x.chain_identifier !== null)
        .sort((a: any, b: any) => a.chain_identifier - b.chain_identifier)
        .map((x: any) => ({
          chainId: x.chain_identifier,
          coingeckoId: x.id,
          image: `https://icons.llamao.fi/icons/chains/rsz_${(
            x.shortname || x.name.split(" ")[0]
          ).toLowerCase()}.jpg`,
          name: x.name,
          nativeCoinId: x.native_coin_id,
          shortName: x.shortname,
        }))

      await writeFile(`${destination}/page-${index + 1}.json`, JSON.stringify(chains, null, 2))

      console.log(`Page ${index + 1} written`)
    })
  )

  return "Success"
}

main().then(console.log).catch(console.error)
