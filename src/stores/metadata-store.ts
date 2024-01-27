import { debounce } from "lodash-es"
import { keepMount, map } from "nanostores"

import { findAssets } from "../api/core/assets-api"
import { findIntegrations } from "../api/core/integrations-api"
import {
  Asset,
  AuditLogOperation,
  Integration,
  IntegrationMetadata,
  TransactionType,
} from "../interfaces"
import { DEFAULT_DEBOUNCE_DURATION, INTEGRATIONS } from "../settings"
import { clancy } from "../workers/remotes"
import { $activeAccount } from "./account-store"

export type FilterOptionsMap = {
  incomingSymbol: string[]
  integration: string[]
  operation: AuditLogOperation[]
  outgoingSymbol: string[]
  symbol: string[]
  type: string[]
  wallet: string[]
}

export type FilterKey = keyof FilterOptionsMap

export const $filterOptionsMap = map<FilterOptionsMap>()

export const FILTER_LABEL_MAP: Record<FilterKey, string> = {
  incomingSymbol: "Incoming Asset",
  integration: "Integration",
  operation: "Operation",
  outgoingSymbol: "Outgoing Asset",
  symbol: "Asset",
  type: "Type",
  wallet: "Wallet",
}

export function getFilterValueLabel(value: string) {
  if (value in INTEGRATIONS) {
    return INTEGRATIONS[value as Integration]
  }

  return value
}

async function computeFilterMap() {
  const integrations = new Set<string>()
  const symbols = new Set<string>()
  const wallets = new Set<string>()
  const operations = new Set<AuditLogOperation>()

  const fileImports = await clancy.getFileImports($activeAccount.get())
  for (const fileImport of fileImports) {
    const { meta } = fileImport

    if (!meta) {
      continue
    }

    integrations.add(meta.integration)
    meta.symbols.forEach((x) => symbols.add(x))
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
    meta.symbols.forEach((x) => symbols.add(x))
    meta.wallets.forEach((x) => wallets.add(x))
    meta.operations.forEach((x) => operations.add(x))
  }

  const symbolOptions = [...symbols].sort()

  const type: TransactionType[] = ["Sell", "Buy", "Swap", "Deposit", "Withdraw", "Unknown"]

  const map: FilterOptionsMap = {
    incomingSymbol: symbolOptions,
    integration: [...integrations].sort(),
    operation: [...operations].sort(),
    outgoingSymbol: symbolOptions,
    symbol: symbolOptions,
    type,
    wallet: [...wallets].sort(),
  }

  $filterOptionsMap.set(map)
  return map
}

export type AssetMap = Record<string, Asset>
export const $assetMap = map<AssetMap>({})

export type IntegrationMap = Partial<Record<Integration, IntegrationMetadata>>
export const $integrationMap = map<IntegrationMap>({})

keepMount($assetMap)
keepMount($filterOptionsMap)
keepMount($integrationMap)

// logAtoms({ $assetMap, $filterMap: $filterOptionsMap, $integrationMap })

export async function computeMetadata() {
  const filterMap = await computeFilterMap()

  const symbolMap = filterMap.symbol.reduce((map, symbol) => {
    map[symbol] = true
    return map
  }, {} as Record<string, boolean>)

  const integrationMap = filterMap.integration.reduce((map, integration) => {
    map[integration] = true
    return map
  }, {} as Record<string, boolean>)

  await Promise.all([
    findAssets(symbolMap).then($assetMap.set),
    findIntegrations(integrationMap).then($integrationMap.set),
  ])
}
export const computeMetadataDebounced = debounce(computeMetadata, DEFAULT_DEBOUNCE_DURATION)
