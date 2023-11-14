import { Asset } from "../interfaces"
import { ASSET_FILES_LOCATION, ASSET_PAGES } from "../settings"

export async function findAssets(symbolMap: Record<string, boolean>) {
  console.log("📜 LOG > findAssets > symbols:", symbolMap)
  const assetMap = {}

  for (let page = 1; page <= ASSET_PAGES; page++) {
    console.log(`Fetching page ${page}`)
    const response = await fetch(`${ASSET_FILES_LOCATION}/page-${page}.json`)
    const assets: Asset[] = await response.json()
    for (const asset of assets) {
      if (symbolMap[asset.symbol]) {
        assetMap[asset.symbol] = asset
      }
    }
    // TODO: stop if completed
    console.log(`Parsed page ${page}`)
  }

  return assetMap
}
