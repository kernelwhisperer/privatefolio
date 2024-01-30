import { PlatformId } from "src/interfaces"

import { memoize } from "./fp-utils"

export const getAssetSymbol = memoize((assetId: string) => {
  const parts = assetId.split(":")
  if (parts.length === 2) return parts[1]
  return parts[2]
})

export const getAssetPlatform = memoize((assetId: string) => {
  return assetId.split(":")[0] as PlatformId
})
