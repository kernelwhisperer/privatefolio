import type Decimal from "decimal.js"

export type TransactionRole = "Maker" | "Taker"
export type TransactionSide = "BUY" | "SELL"
export type TransactionType = "Buy" | "Sell"
export type ExchangeId = "mexc" | "binance"

export type BigNumber = Decimal

export interface Transaction {
  amount: number
  amountBN: BigNumber
  exchange: ExchangeId
  fee: number
  feeBN: BigNumber
  feeSymbol: string
  filledPrice: number
  filledPriceBN: BigNumber
  id: number
  quoteSymbol: string
  role: TransactionRole
  side: TransactionSide
  symbol: string
  timestamp: number
  total: number
  totalBN: BigNumber
  type: TransactionType
}

export type AuditLogOperation =
  | "Deposit"
  | "Buy"
  | "Sell"
  | "Fee"
  | "Distribution"
  | "Withdraw"
  | "Funding Fee"
export type Integration = "Binance" | "Mexc Global"

export interface AuditLog {
  change: string
  changeBN: BigNumber
  id: string
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

export interface Asset {
  coingeckoId: string
  image: string
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
