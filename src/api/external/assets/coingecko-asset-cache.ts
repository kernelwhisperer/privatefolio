import { AssetMetadata, CoingeckoMetadataShort } from "src/interfaces"
import { getAssetTicker, isEvmPlatform } from "src/utils/assets-utils"

import { ASSET_FILES_LOCATION } from "../../../settings"
import { memoryCacheMap } from "./coingecko-asset-memory-cache"

export async function getCachedCoingeckoId(assetId: string): Promise<string> {
  const parts = assetId.split(":")
  const platform = parts[0]

  let coingeckoId: string
  if (isEvmPlatform(platform)) {
    const contract = parts[1]

    const geckoIdReq = await fetch(`/${ASSET_FILES_LOCATION}/${platform}/${contract}`)
    coingeckoId = (await geckoIdReq.text()) as string
  } else if (platform === "binance") {
    const symbol = parts[1]

    const geckoIdReq = await fetch(`/${ASSET_FILES_LOCATION}/symbol/${symbol}`)
    coingeckoId = (await geckoIdReq.text()) as string
  } else {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  return coingeckoId
}

export async function getCachedAssetMeta(assetId: string): Promise<AssetMetadata> {
  if (memoryCacheMap[assetId]) {
    return memoryCacheMap[assetId]
  }

  const coingeckoId = await getCachedCoingeckoId(assetId)
  const symbol = getAssetTicker(assetId)

  const geckoMetaReq = await fetch(`/${ASSET_FILES_LOCATION}/meta/${coingeckoId}`)
  const metaShort = (await geckoMetaReq.json()) as CoingeckoMetadataShort

  return {
    ...metaShort,
    coingeckoId,
    symbol,
  }
}
