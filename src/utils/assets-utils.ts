import { PlatformId } from "src/interfaces"

import { memoize } from "./fp-utils"

export const getAssetTicker = memoize(function getAssetTicker(assetId: string) {
  if (assetId === undefined) return "-"

  const parts = assetId.split(":")
  if (parts.length === 2) return parts[1]
  return parts[2]
})

export const getAssetPlatform = memoize((assetId: string) => {
  return assetId.split(":")[0] as PlatformId
})
