import { debounce } from "lodash-es"
import { keepMount, map } from "nanostores"
import { getAssetTicker } from "src/utils/assets-utils"

import { Asset, FilterOptionsMap, PlatformId } from "../interfaces"
import { DEFAULT_DEBOUNCE_DURATION, PLATFORMS_META } from "../settings"
import { clancy } from "../workers/remotes"
import { $activeAccount } from "./account-store"

export type FilterKey = keyof FilterOptionsMap

export const $filterOptionsMap = map<FilterOptionsMap>()

export const FILTER_LABEL_MAP: Record<FilterKey, string> = {
  assetId: "Asset",
  feeAsset: "Fee Asset",
  incomingAsset: "Incoming Asset",
  operation: "Operation",
  outgoingAsset: "Outgoing Asset",
  platform: "Platform",
  type: "Type",
  wallet: "Wallet",
}

export function getFilterValueLabel(value: string) {
  if (value === undefined) return

  if (value in PLATFORMS_META) {
    return PLATFORMS_META[value as PlatformId].name
  }

  if (value.includes(":")) {
    return getAssetTicker(value)
  }

  return value
}

export async function computeFilterMap() {
  const map = await clancy.getFilterMap($activeAccount.get())
  $filterOptionsMap.set(map)
  return map
}

export type AssetMap = Record<string, Asset>
export const $assetMap = map<AssetMap>({})

keepMount($assetMap)
keepMount($filterOptionsMap)

export async function computeMetadata() {
  const filterMap = await computeFilterMap()
  const map = await clancy.getAssetMap($activeAccount.get(), filterMap.assetId)
  $assetMap.set(map)
  return map
}
export const computeMetadataDebounced = debounce(computeMetadata, DEFAULT_DEBOUNCE_DURATION)

// logAtoms({ $assetMap, $filterMap: $filterOptionsMap, $platformMetaMap })
