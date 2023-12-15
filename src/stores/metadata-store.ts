import { debounce } from "lodash"
import { keepMount, map } from "nanostores"

import { findAssets } from "../api/assets-api"
import { findExchanges } from "../api/exchanges-api"
import { Asset, AuditLogOperation, Exchange } from "../interfaces"
import { logAtoms } from "../utils/browser-utils"
import { clancy } from "../workers/remotes"

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

async function computeFilterMap() {
  const fileImports = await clancy.getFileImports()

  const integrations = new Set<string>()
  const symbols = new Set<string>()
  const wallets = new Set<string>()
  const operations = new Set<AuditLogOperation>()

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

  const symbolOptions = [...symbols].sort()

  const map: FilterOptionsMap = {
    incomingSymbol: symbolOptions,
    integration: [...integrations].sort(),
    operation: [...operations].sort(),
    outgoingSymbol: symbolOptions,
    symbol: symbolOptions,
    type: ["Sell", "Buy", "Swap"],
    wallet: [...wallets].sort(),
  }

  $filterOptionsMap.set(map)
  return map
}

export type AssetMap = Record<string, Asset>
export const $assetMap = map<AssetMap>({})

export type IntegrationMap = Record<string, Exchange>
export const $integrationMap = map<IntegrationMap>({})

keepMount($assetMap)
keepMount($filterOptionsMap)
keepMount($integrationMap)

logAtoms({ $assetMap, $filterMap: $filterOptionsMap, $integrationMap })

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
    findExchanges(integrationMap).then($integrationMap.set),
  ])
}
export const computeMetadataDebounced = debounce(computeMetadata, 500) // TESTME
