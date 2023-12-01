import { keepMount, map } from "nanostores"

import { getFileImports } from "../api/file-import-api"
import { Asset, AuditLogOperation, Exchange } from "../interfaces"
import { logAtoms } from "../utils/utils"

type FilterMap = {
  integration: string[]
  operation: AuditLogOperation[]
  symbol: string[]
  wallet: string[]
}

export type FilterKey = keyof FilterMap

export const $filterMap = map<FilterMap>()

export const LABEL_MAP: Record<FilterKey, string> = {
  integration: "Integration",
  operation: "Operation",
  symbol: "Asset",
  wallet: "Wallet",
}

export async function computeFilterMap() {
  const filterMap = $filterMap.get()
  if (Object.keys(filterMap).length > 0) return filterMap

  const fileImports = await getFileImports()

  const integrations = new Set<string>()
  const symbols = new Set<string>()
  const wallets = new Set<string>()
  const operations = new Set<AuditLogOperation>()

  for (const fileImport of fileImports) {
    const { meta, lastModified } = fileImport

    if (!meta) throw new Error("This should not happen")

    integrations.add(meta.integration)
    meta.symbols.forEach((x) => symbols.add(x))
    meta.wallets.forEach((x) => wallets.add(x))
    meta.operations.forEach((x) => operations.add(x))
  }

  const map: FilterMap = {
    integration: [...integrations].sort(),
    operation: [...operations].sort(),
    symbol: [...symbols].sort(),
    wallet: [...wallets].sort(),
  }

  $filterMap.set(map)
  return map
}

export type AssetMap = Record<string, Asset>
export const $assetMap = map<AssetMap>({})

export type IntegrationMap = Record<string, Exchange>
export const $integrationMap = map<IntegrationMap>({})

keepMount($assetMap)
keepMount($filterMap)
keepMount($integrationMap)

logAtoms({ $assetMap, $filterMap, $integrationMap })
