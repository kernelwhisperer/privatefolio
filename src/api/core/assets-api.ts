import { Asset } from "../../interfaces"
import { ASSET_FILES_LOCATION, ASSET_PAGES } from "../../settings"
import { AssetMap } from "../../stores/metadata-store"

export async function findAssets(symbolMap: Record<string, boolean>) {
  const map: AssetMap = {
    EUR: {
      image: "/assets/overrides/EUR.png",
      isStablecoin: true,
      name: "Euro",
      symbol: "EUR",
    },
  }

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

        if (asset.symbol === "BUSD") {
          map[asset.symbol].image = "/assets/overrides/BUSD.svg"
        }
      }
    }
    // TODO: stop if completed
    // console.log(`Assets: Parsed page ${page}`)
  }

  return map
}
