export const ASSET_PAGES = 10
export const ASSET_FILES_LOCATION = "app-images/assets"

export const EXCHANGE_PAGES = 2
export const EXCHANGE_FILES_LOCATION = "app-images/exchanges"

export const BLOCKCHAIN_PAGES = 1
export const BLOCKCHAIN_FILES_LOCATION = "app-images/blockchains"

export enum FileImportParser {
  "binance",
  "mexc",
  "coinmama",
  "etherscan",
  "etherscan-erc20",
}

export const INTEGRATION_IDS = [
  "arbitrum",
  "binance",
  "coinmama",
  "ethereum",
  "evm",
  "mexc",
  "op",
  "polygon",
] as const

export type Integration = (typeof INTEGRATION_IDS)[number]

export const INTEGRATIONS: Record<Integration, string> = {
  arbitrum: "Arbitrum",
  binance: "Binance",
  coinmama: "Coinmama",
  ethereum: "Ethereum",
  evm: "EVM network",
  mexc: "MEXC",
  op: "Optimism",
  polygon: "Polygon",
} as const

export const CONNECTIONS = {
  ethereum: "Ethereum",
} as const

export const DEFAULT_DEBOUNCE_DURATION = 1500

export const DB_OPERATION_PAGE_SIZE = 1000
export const PRICE_API_PAGINATION = 900 // coinbase limit is 300, binance is 1000

export const DISALLOW_BINANCE_PRICE_API = import.meta.env.DISALLOW_BINANCE_PRICE_API === "true"
export const APP_VERSION = import.meta.env.VITE_APP_VERSION?.replaceAll('"', "")
export const GIT_HASH = import.meta.env.VITE_GIT_HASH
export const GIT_DATE = import.meta.env.VITE_GIT_DATE
