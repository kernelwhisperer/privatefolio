import { Asset } from "../interfaces"
import { ASSET_FILES_LOCATION, ASSET_PAGES } from "../settings"

export async function findAssets(symbolMap: Record<string, boolean>) {
  const map: Record<string, Asset> = {}

  if (Object.keys(symbolMap).length === 0) {
    return map
  }

  for (let page = 1; page <= ASSET_PAGES; page++) {
    // console.log(`Assets: Fetching page ${page}`)
    const response = await fetch(`${ASSET_FILES_LOCATION}/page-${page}.json`)
    const assets: Asset[] = await response.json()

    for (const asset of assets) {
      if (symbolMap[asset.symbol]) {
        map[asset.symbol] = asset
      }
    }
    // TODO: stop if completed
    // console.log(`Assets: Parsed page ${page}`)
  }

  return map
}
