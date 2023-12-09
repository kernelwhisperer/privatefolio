import type Decimal from "decimal.js"

export type TransactionRole = "Maker" | "Taker"
export type TransactionSide = "BUY" | "SELL"
export type TransactionType = "Buy" | "Sell" | "Swap"
// type ExchangeId = "mexc" | "binance"

export type BigNumber = Decimal

/**
 * Timestamp in milliseconds
 *
 * @example 1612137600000
 * @example Date.now() - TZ_OFFSET
 */
export type Timestamp = number // Nominal<number, "Timestamp">

/**
 * Timestamp in seconds
 *
 * @example 161213760
 * @example Date.now() - TZ_OFFSET / 1000
 */
export type Time = number

export interface Transaction {
  _id: string
  amount: string
  amountN: number
  fee?: string
  feeN?: number
  feeSymbol?: string
  integration: Integration
  price: string
  priceN: number
  quoteSymbol: string
  role?: TransactionRole
  symbol: string
  timestamp: Timestamp
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
  timestamp: Timestamp
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
  timestamp: Timestamp
}

export interface Balance {
  balance: number
  symbol: string
}

export interface BalanceMap {
  [symbol: string]: number
  timestamp: Timestamp
}

export interface SavedPrice {
  pair: string
  price: Candle | number
  source: string
  symbol: string
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

export type Timeframe = "Block" | "Minute" | "Hour" | "Day" | "Week"
export const TIME_FRAMES: Record<Timeframe, string> = {
  Block: "Block",
  Minute: "1m",
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  Hour: "1h",
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  Day: "D",
  Week: "W",
}

export enum PriceUnit {
  ETH = "ETH",
  USD = "USD",
  GWEI = "Gwei",
}

/**
 * @internal
 */
export type BlockData = {
  baseFeePerGas: string // BigInt
  timestamp: string
}

/**
 * [
 *   1499040000000,      // Kline open time
 *   "0.01634790",       // Open price
 *   "0.80000000",       // High price
 *   "0.01575800",       // Low price
 *   "0.01577100",       // Close price
 *   "148976.11427815",  // Volume
 *   1499644799999,      // Kline Close time
 *   "2434.19055334",    // Quote asset volume
 *   308,                // Number of trades
 *   "1756.87402397",    // Taker buy base asset volume
 *   "28.46694368",      // Taker buy quote asset volume
 *   "0"                 // Unused field, ignore.
 * ]
 */
export type BinanceKline = [
  Timestamp, // timestamp
  string, // open
  string, // high
  string, // low
  string, // close
  string // volume
]

/**
 * [
 *   1696564320,  // time - bucket start time
 *   27557.89,    // low - lowest price during the bucket interval
 *   27567.36,    // high - highest price during the bucket interval
 *   27566.42,    // open - opening price (first trade) in the bucket interval
 *   27562.16,    // close - closing price (last trade) in the bucket interval
 *   4.15468916   // volume - volume of trading activity during the bucket interval
 * ]
 */
export type CoinbaseBucket = [
  Time, // time
  number, // low
  number, // high
  number, // open
  number, // close
  number // volume
]

export type Candle = {
  close: number
  high: number
  low: number
  open: number
  time: Time
  volume?: number
}

export type QueryRequest = {
  /**
   * @default 300
   */
  limit?: number
  pair?: string
  priceUnit?: PriceUnit
  since?: Timestamp
  timeInterval: ResolutionString
  until?: Timestamp
  variant?: number
}
export type QueryResult = Promise<Candle[]>
export type QueryFn = (request: QueryRequest) => QueryResult

export const DEFAULT_POLLING_INTERVAL = 2_000

export type SubscribeRequest = {
  onError?: (error: unknown) => void
  onNewData: (data: Candle) => void
  /**
   * in milliseconds
   * @default 2000
   */
  pollingInterval?: number
  priceUnit?: PriceUnit
  since?: string
  timeframe: Timeframe
  variant?: number
}

export type LoggerFn = (message: string, metadata?: object) => void

/**
 * @returns cleanup function used to unsubscribe
 */
export type SubscribeResult = () => void
export type SubscribeFn = (request: SubscribeRequest, logger?: LoggerFn) => SubscribeResult
