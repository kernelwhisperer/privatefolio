import Decimal from "decimal.js"

export type TradeRole = "Maker" | "Taker"
export type TradeSide = "BUY" | "SELL"

export interface ServerTrade {
  amount: Decimal
  baseSymbol: string
  datetime: string
  fee: string
  filledPrice: Decimal
  id: number
  role: TradeRole
  side: TradeSide
  symbol: string
  total: Decimal
}

export interface Trade extends Record<string, number | string> {
  amount: number
  baseSymbol: string
  datetime: string
  fee: string
  filledPrice: number
  id: number
  role: TradeRole
  side: TradeSide
  symbol: string
  total: number
}
