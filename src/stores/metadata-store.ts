import { debounce } from "lodash-es"
import { keepMount, map } from "nanostores"
import { getAssetSymbol } from "src/utils/assets-utils"

import { findAssets } from "../api/core/assets-api"
import { findIntegrations } from "../api/core/integrations-api"
import {
  AssetMetadata,
  AuditLogOperation,
  Integration,
  IntegrationMetadata,
  TransactionType,
} from "../interfaces"
import { DEFAULT_DEBOUNCE_DURATION, INTEGRATIONS } from "../settings"
import { clancy } from "../workers/remotes"
import { $activeAccount } from "./account-store"

export type FilterOptionsMap = {
  assetId: string[]
  incomingAsset: string[]
  integration: string[]
  operation: AuditLogOperation[]
  outgoingAsset: string[]
  type: string[]
  wallet: string[]
}

export type FilterKey = keyof FilterOptionsMap

export const $filterOptionsMap = map<FilterOptionsMap>()

export const FILTER_LABEL_MAP: Record<FilterKey, string> = {
  assetId: "Asset",
  incomingAsset: "Incoming Asset",
  integration: "Integration",
  operation: "Operation",
  outgoingAsset: "Outgoing Asset",
  type: "Type",
  wallet: "Wallet",
}

export function getFilterValueLabel(value: string) {
  if (value in INTEGRATIONS) {
    return INTEGRATIONS[value as Integration]
  }

  return getAssetSymbol(value)
}

async function computeFilterMap() {
  const integrations = new Set<string>()
  const assetIds = new Set<string>()
  const wallets = new Set<string>()
  const operations = new Set<AuditLogOperation>()

  const fileImports = await clancy.getFileImports($activeAccount.get())
  for (const fileImport of fileImports) {
    const { meta } = fileImport

    if (!meta) {
      continue
    }

    integrations.add(meta.integration)
    meta.assetIds.forEach((x) => assetIds.add(x))
    meta.wallets.forEach((x) => wallets.add(x))
    meta.operations.forEach((x) => operations.add(x))
  }

  const connections = await clancy.getConnections($activeAccount.get())
  for (const connection of connections) {
    const { integration, meta } = connection

    if (!meta) {
      continue
    }

    integrations.add(integration)
    meta.assetIds.forEach((x) => assetIds.add(x))
    meta.wallets.forEach((x) => wallets.add(x))
    meta.operations.forEach((x) => operations.add(x))
  }

  const assetIdOptions = [...assetIds].sort()

  const type: TransactionType[] = ["Sell", "Buy", "Swap", "Deposit", "Withdraw", "Unknown"]

  const map: FilterOptionsMap = {
    assetId: assetIdOptions,
    incomingAsset: assetIdOptions,
    integration: [...integrations].sort(),
    operation: [...operations].sort(),
    outgoingAsset: assetIdOptions,
    type,
    wallet: [...wallets].sort(),
  }

  $filterOptionsMap.set(map)
  return map
}

export type AssetMap = Record<string, AssetMetadata>
export const $assetMetaMap = map<AssetMap>({})

export type IntegrationMap = Partial<Record<Integration, IntegrationMetadata>>
export const $integrationMetaMap = map<IntegrationMap>({})

keepMount($assetMetaMap)
keepMount($filterOptionsMap)
keepMount($integrationMetaMap)

// logAtoms({ $assetMap, $filterMap: $filterOptionsMap, $integrationMap })

export async function computeMetadata() {
  const filterMap = await computeFilterMap()

  const integrationMap = filterMap.integration.reduce((map, integration) => {
    map[integration] = true
    return map
  }, {} as Record<string, boolean>)

  await Promise.all([
    findAssets(filterMap.assetId).then($assetMetaMap.set),
    findIntegrations(integrationMap).then($integrationMetaMap.set),
  ])
}
export const computeMetadataDebounced = debounce(computeMetadata, DEFAULT_DEBOUNCE_DURATION)
