import type Decimal from "decimal.js"

export type TransactionRole = "Maker" | "Taker"
export type TransactionSide = "BUY" | "SELL"
export type TransactionType = "Buy" | "Sell"
export type Exchange = "mexc" | "binance"

export type BigNumber = Decimal

export interface Transaction {
  amount: number
  amountBN: BigNumber
  exchange: Exchange
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
