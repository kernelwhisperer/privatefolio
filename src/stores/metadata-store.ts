import { debounce } from "lodash-es"
import { keepMount, map } from "nanostores"
import { getAssetTicker } from "src/utils/assets-utils"

import {
  Asset,
  AuditLogOperation,
  PlatformId,
  TRANSACTIONS_TYPES,
  TransactionType,
} from "../interfaces"
import { DEFAULT_DEBOUNCE_DURATION, PLATFORMS_META } from "../settings"
import { clancy } from "../workers/remotes"
import { $activeAccount } from "./account-store"

export type FilterOptionsMap = {
  assetId: string[]
  feeAsset: string[]
  incomingAsset: string[]
  operation: AuditLogOperation[]
  outgoingAsset: string[]
  platform: string[]
  type: readonly TransactionType[]
  wallet: string[]
}

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
    feeAsset: assetIdOptions,
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

export type AssetMap = Record<string, Asset>
export const $assetMap = map<AssetMap>({})

keepMount($assetMap)
keepMount($filterOptionsMap)

export async function computeMetadata() {
  const filterMap = await computeFilterMap()
  await clancy.getAssetMap($activeAccount.get(), filterMap.assetId).then($assetMap.set)
}
export const computeMetadataDebounced = debounce(computeMetadata, DEFAULT_DEBOUNCE_DURATION)

// logAtoms({ $assetMap, $filterMap: $filterOptionsMap, $platformMetaMap })
