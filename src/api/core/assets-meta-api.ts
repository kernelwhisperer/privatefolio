import { getAssetTicker } from "src/utils/assets-utils"

import { AssetMetadata } from "../../interfaces"
import { ASSET_FILES_LOCATION, ASSET_PAGES } from "../../settings"
import { AssetMap } from "../../stores/metadata-store"

export async function findAssetsMeta(assetIds: string[]) {
  const map: AssetMap = {}

  if (assetIds.length === 0) {
    return map
  }

  const assetSymbolMap = assetIds.reduce((map, assetId) => {
    map[getAssetTicker(assetId)] = assetId
    return map
  }, {} as Record<string, string>)

  for (let page = 1; page <= ASSET_PAGES; page++) {
    try {
      // console.log(`Assets: Fetching page ${page}`)
      const response = await fetch(`/${ASSET_FILES_LOCATION}/page-${page}.json`)
      const assets: AssetMetadata[] = await response.json()

      for (const asset of assets) {
        if (assetSymbolMap[asset.symbol]) {
          const assetId = assetSymbolMap[asset.symbol]
          if (map[assetId]) continue
          map[assetId] = asset
        }
      }
      // console.log(
      //   `Assets: Parsed page ${page}, progress ${Object.keys(map).length} / ${
      //     Object.keys(symbolMap).length
      //   }`
      // )

      if (Object.keys(map).length === Object.keys(assetSymbolMap).length) {
        break
      }
    } catch (error) {}
  }

  // overrides
  map["binance:EUR"] = {
    image: `/${ASSET_FILES_LOCATION}/overrides/EUR.png`,
    isStablecoin: true,
    name: "Euro",
    symbol: "EUR",
  }
  map["ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2:WETH"] = {
    image: `https://assets.coingecko.com/coins/images/2518/standard/weth.png`,
    name: "Wrapped ETH",
    symbol: "WETH",
  }

  if (map.BUSD) map.BUSD.image = `/${ASSET_FILES_LOCATION}/overrides/BUSD.svg`

  // TODO local cache
  return map
}
