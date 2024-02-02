import { debounce } from "lodash-es"
import { keepMount, map } from "nanostores"
import { getAssetSymbol } from "src/utils/assets-utils"

import { findAssetsMeta } from "../api/core/assets-meta-api"
import { findPlatformsMeta } from "../api/core/platforms-meta-api"
import {
  AssetMetadata,
  AuditLogOperation,
  Platform,
  PlatformMetadata,
  TRANSACTIONS_TYPES,
} from "../interfaces"
import { DEFAULT_DEBOUNCE_DURATION, PLATFORMS_META } from "../settings"
import { clancy } from "../workers/remotes"
import { $activeAccount } from "./account-store"

export type FilterOptionsMap = {
  assetId: string[]
  incomingAsset: string[]
  operation: AuditLogOperation[]
  outgoingAsset: string[]
  platform: string[]
  type: string[]
  wallet: string[]
}

export type FilterKey = keyof FilterOptionsMap

export const $filterOptionsMap = map<FilterOptionsMap>()

export const FILTER_LABEL_MAP: Record<FilterKey, string> = {
  assetId: "Asset",
  incomingAsset: "Incoming Asset",
  operation: "Operation",
  outgoingAsset: "Outgoing Asset",
  platform: "Platform",
  type: "Type",
  wallet: "Wallet",
}

export function getFilterValueLabel(value: string) {
  if (value in PLATFORMS_META) {
    return PLATFORMS_META[value as Platform].name
  }

  if (value.includes(":")) {
    return getAssetSymbol(value)
  }

  return value
}

async function computeFilterMap() {
  const platforms = new Set<string>()
  const assetIds = new Set<string>()
  const wallets = new Set<string>()
  const operations = new Set<AuditLogOperation>()

  const fileImports = await clancy.getFileImports($activeAccount.get())
  for (const fileImport of fileImports) {
    const { meta } = fileImport

    if (!meta) {
      continue
    }

    platforms.add(meta.platform)
    meta.assetIds.forEach((x) => assetIds.add(x))
    meta.wallets.forEach((x) => wallets.add(x))
    meta.operations.forEach((x) => operations.add(x))
  }

  const connections = await clancy.getConnections($activeAccount.get())
  for (const connection of connections) {
    const { platform, meta } = connection

    if (!meta) {
      continue
    }

    platforms.add(platform)
    meta.assetIds.forEach((x) => assetIds.add(x))
    meta.wallets.forEach((x) => wallets.add(x))
    meta.operations.forEach((x) => operations.add(x))
  }

  const assetIdOptions = [...assetIds].sort()

  const map: FilterOptionsMap = {
    assetId: assetIdOptions,
    incomingAsset: assetIdOptions,
    operation: [...operations].sort(),
    outgoingAsset: assetIdOptions,
    platform: [...platforms].sort(),
    type: TRANSACTIONS_TYPES,
    wallet: [...wallets].sort(),
  }

  $filterOptionsMap.set(map)
  return map
}

export type AssetMap = Record<string, AssetMetadata>
export const $assetMetaMap = map<AssetMap>({})

export type PlatformMap = Partial<Record<Platform, PlatformMetadata>>
export const $platformMetaMap = map<PlatformMap>({})

keepMount($assetMetaMap)
keepMount($filterOptionsMap)
keepMount($platformMetaMap)

// logAtoms({ $assetMap, $filterMap: $filterOptionsMap, $platformMetaMap })

export async function computeMetadata() {
  const filterMap = await computeFilterMap()

  const platformMap = filterMap.platform.reduce((map, platform) => {
    map[platform] = true
    return map
  }, {} as Record<string, boolean>)

  await Promise.all([
    findAssetsMeta(filterMap.assetId).then($assetMetaMap.set),
    findPlatformsMeta(platformMap).then($platformMetaMap.set),
  ])
}
export const computeMetadataDebounced = debounce(computeMetadata, DEFAULT_DEBOUNCE_DURATION)
