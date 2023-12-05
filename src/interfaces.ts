import type Decimal from "decimal.js"

export type TransactionRole = "Maker" | "Taker"
export type TransactionSide = "BUY" | "SELL"
export type TransactionType = "Buy" | "Sell"
// type ExchangeId = "mexc" | "binance"

export type BigNumber = Decimal

export interface Transaction {
  _id: string
  amount: string
  amountN: number
  fee: string
  feeN: number
  feeSymbol: string
  integration: Integration
  price: string
  priceN: number
  quoteSymbol: string
  role?: TransactionRole
  symbol: string
  timestamp: number
  total: string
  totalN: number
  type: TransactionType
  wallet: string
}

export type AuditLogOperation =
  | "Deposit"
  | "Buy"
  | "Sell"
  | "Fee"
  | "Distribution"
  | "Withdraw"
  | "Funding Fee"

export type Integration = "Binance" | "MEXC"

export interface Asset {
  coingeckoId: string
  image: string
  isStablecoin: boolean
  name: string
  symbol: string
}

export interface Exchange {
  coingeckoId: string
  coingeckoTrustScore: number
  coingeckoTrustScoreRank: number
  country: string
  image: string
  name: string
  symbol: string
  url: string
  year: number
}

export interface AuditLog {
  _id: string
  balance?: number
  change: string
  changeN: number
  integration: Integration
  operation: AuditLogOperation
  symbol: string
  timestamp: number
  wallet: string
}

export interface BinanceAuditLog extends AuditLog {
  account: string
  coin: string
  remark: string
  userId: string
  utcTime: string
}

export interface FileImport {
  _id: string
  _rev: string
  lastModified: number
  meta?: {
    integration: string
    logs: number
    operations: AuditLogOperation[]
    rows: number
    symbols: string[]
    transactions: number
    wallets: string[]
  }
  name: string
  size: number
  timestamp: number
}

export interface Balance {
  balance: number
  symbol: string
}

export interface BalanceMap {
  [symbol: string]: number
  timestamp: number
}
