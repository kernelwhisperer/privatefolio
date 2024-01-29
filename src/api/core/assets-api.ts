import { AssetMetadata } from "../../interfaces"
import { ASSET_FILES_LOCATION, ASSET_PAGES } from "../../settings"
import { AssetMap } from "../../stores/metadata-store"

export async function findAssets(symbolMap: Record<string, boolean>) {
  const map: AssetMap = {}

  if (Object.keys(symbolMap).length === 0) {
    return map
  }

  for (let page = 1; page <= ASSET_PAGES; page++) {
    try {
      // console.log(`Assets: Fetching page ${page}`)
      const response = await fetch(`/${ASSET_FILES_LOCATION}/page-${page}.json`)
      const assets: AssetMetadata[] = await response.json()

      for (const asset of assets) {
        if (symbolMap[asset.symbol] && !map[asset.symbol]) {
          map[asset.symbol] = asset
        }
      }
      // console.log(
      //   `Assets: Parsed page ${page}, progress ${Object.keys(map).length} / ${
      //     Object.keys(symbolMap).length
      //   }`
      // )

      if (Object.keys(map).length === Object.keys(symbolMap).length) {
        break
      }
    } catch (error) {}
  }

  // overrides
  map.EUR = {
    image: `/${ASSET_FILES_LOCATION}/overrides/EUR.png`,
    isStablecoin: true,
    name: "Euro",
    symbol: "EUR",
  }

  if (map.BUSD) map.BUSD.image = `/${ASSET_FILES_LOCATION}/overrides/BUSD.svg`

  // TODO local cache
  return map
}
