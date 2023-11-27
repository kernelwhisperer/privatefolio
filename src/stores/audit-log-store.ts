import { map } from "nanostores"

import { getFileImports } from "../api/file-import-api"
import { AuditLogOperation } from "../interfaces"
import { logAtoms } from "../utils/utils"

type FilterMap = {
  integration: string[]
  operation: AuditLogOperation[]
  symbol: string[]
  wallet: string[]
}

export type FilterKey = keyof FilterMap

export const $filterMap = map<FilterMap>()

export type ActiveFilterMap = {
  integration?: string
  operation?: string
  symbol?: string
  wallet?: string
}

export const $activeFilters = map<ActiveFilterMap>({})

logAtoms({ $activeFilters, $filterMap })

export async function computeFilterMap() {
  if (!$filterMap.get()) return

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

  $filterMap.set({
    integration: [...integrations],
    operation: [...operations],
    symbol: [...symbols],
    wallet: [...wallets],
  })
}

export const LABEL_MAP: Record<FilterKey, string> = {
  integration: "Integration",
  operation: "Operation",
  symbol: "Asset",
  wallet: "Wallet",
}
