export const ASSET_PAGES = 10
export const ASSET_FILES_LOCATION = "app-images/assets"

export const EXCHANGE_PAGES = 2
export const EXCHANGE_FILES_LOCATION = "app-images/exchanges"

export const BLOCKCHAIN_PAGES = 1
export const BLOCKCHAIN_FILES_LOCATION = "app-images/blockchains"

export const PARSERS_META = {
  binance: "Binance",
  // binance: "Binance Tax Report",
  // "binance-trades": "Binance Trade History", // TODO
  // "binance-futures": "Binance Futures History", // TODO
  coinmama: "Coinmama",
  etherscan: "Etherscan",
  "etherscan-erc20": "Etherscan ERC-20",
  "etherscan-internal": "Etherscan Internal",
  mexc: "Mexc",
} as const

export type ParserId = keyof typeof PARSERS_META

export const PARSER_IDS = Object.keys(PARSERS_META) as ParserId[]

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
}

export const CONNECTIONS = {
  ethereum: "Ethereum",
} as const

export const DEFAULT_DEBOUNCE_DURATION = 1500

export const DB_OPERATION_PAGE_SIZE = 1000
export const PRICE_API_PAGINATION = 900 // coinbase limit is 300, binance is 1000
