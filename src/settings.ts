export const ASSET_PAGES = 10
export const ASSET_FILES_LOCATION = "app-images/assets"

export const EXCHANGE_PAGES = 2
export const EXCHANGE_FILES_LOCATION = "app-images/exchanges"

export const BLOCKCHAIN_PAGES = 1
export const BLOCKCHAIN_FILES_LOCATION = "app-images/blockchains"

export const PARSER_IDS = [
  "binance-account-statement",
  "binance-spot-history",
  // "binance-deposit-history",
  "coinmama",
  "etherscan",
  "etherscan-erc20",
  "etherscan-internal",
  "mexc",
] as const

export type ParserId = (typeof PARSER_IDS)[number]

export type ParserMeta = {
  name: string
  // platformImage: string
}

export const PARSERS_META: Record<ParserId, ParserMeta> = {
  "binance-account-statement": {
    name: "Binance Account Statement",
  },
  // "binance-deposit-history": {
  //   name: "Binance Deposit History",
  // },
  "binance-spot-history": {
    name: "Binance Spot History",
  },
  coinmama: { name: "Coinmama" },
  etherscan: { name: "Etherscan" },
  "etherscan-erc20": { name: "Etherscan ERC-20" },
  "etherscan-internal": { name: "Etherscan Internal" },
  mexc: { name: "Mexc" },
}

export const PLATFORM_IDS = [
  // "arbitrum",
  "binance",
  "coinmama",
  "ethereum",
  // "evm",
  "mexc",
  // "op",
  // "polygon",
] as const

export type Platform = (typeof PLATFORM_IDS)[number]

export type PlatformMeta = {
  name: string
}

export const PLATFORMS_META: Record<Platform, PlatformMeta> = {
  binance: { name: "Binance" },
  coinmama: { name: "Coinmama" },
  ethereum: { name: "Ethereum" },
  mexc: { name: "MEXC Global" },
}

export const CONNECTIONS = {
  ethereum: "Ethereum",
} as const

export const DEFAULT_DEBOUNCE_DURATION = 1500

export const DB_OPERATION_PAGE_SIZE = 1000
export const PRICE_API_PAGINATION = 900 // coinbase limit is 300, binance is 1000
