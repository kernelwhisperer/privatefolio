import { ResolutionString } from "./interfaces"

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
  number, // time
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
  number, // time
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
  time: number
  volume?: number
}

export type QueryRequest = {
  /**
   * @default 1000
   */
  limit?: number
  pair?: string
  priceUnit?: PriceUnit
  since?: string
  timeInterval: ResolutionString
  until?: string
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
