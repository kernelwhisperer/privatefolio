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

/**
 * This is the generic type useful for declaring a nominal type,
 * which does not structurally matches with the base type and
 * the other types declared over the same base type
 *
 * Usage:
 * @example
 * type Index = Nominal<number, 'Index'>;
 * // let i: Index = 42; // this fails to compile
 * let i: Index = 42 as Index; // OK
 * @example
 * type TagName = Nominal<string, 'TagName'>;
 */
export declare type Nominal<T, Name extends string> = T & {
  [Symbol.species]: Name
}
/**
 * Resolution or time interval is a time period of one bar. Advanced Charts supports tick, intraday (seconds, minutes, hours), and DWM (daily, weekly, monthly) resolutions. The table below describes how to specify different types of resolutions:
 *
 * Resolution | Format | Example
 * ---------|----------|---------
 * Ticks | `xT` | `1T` — one tick
 * Seconds | `xS` | `1S` — one second
 * Minutes | `x` | `1` — one minute
 * Hours | `x` minutes | `60` — one hour
 * Days | `xD` | `1D` — one day
 * Weeks | `xW` | `1W` — one week
 * Months | `xM` | `1M` — one month
 * Years | `xM` months | `12M` — one year
 *
 * Refer to [Resolution](https://www.tradingview.com/charting-library-docs/latest/core_concepts/Resolution) for more information.
 */
export type ResolutionString = Nominal<string, "ResolutionString">
