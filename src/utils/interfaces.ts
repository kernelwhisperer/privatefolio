import Decimal from "decimal.js"

export type TransactionRole = "Maker" | "Taker"
export type TransactionSide = "BUY" | "SELL"
export type TransactionType = "Buy" | "Sell"

export interface ParsedTransaction {
  amount: Decimal
  datetime: string
  fee: Decimal
  feeSymbol: string
  filledPrice: Decimal
  id: number
  quoteSymbol: string
  role: TransactionRole
  side: TransactionSide
  symbol: string
  total: Decimal
}

export interface Transaction extends Record<string, number | string> {
  amount: number
  datetime: string
  fee: number
  feeSymbol: string
  filledPrice: number
  id: number
  quoteSymbol: string
  role: TransactionRole
  side: TransactionSide
  symbol: string
  total: number
  type: TransactionType
}
