import Decimal from "decimal.js"

import { ServerTrade, TradeRole, TradeSide } from "./interfaces"

export async function readCsv<T>(
  filePath: string,
  transformer: (input: string[], index: number) => T
): Promise<T[]> {
  const response = await fetch(filePath)
  const text = await response.text()

  // Parse CSV text
  const rows = text.split("\n").map((row) => row.split(","))
  const tradeHistory: T[] = []

  rows.slice(1).forEach((row, index) => {
    try {
      const obj = transformer(row, index)
      tradeHistory.push(obj)
    } catch {}
  })

  return tradeHistory
}

export function mexcTransformer(csvRow: string[], index: number): ServerTrade {
  const ticker = csvRow[0]
  const filledPrice = new Decimal(csvRow[3].split(" ")[0])
  const amount = new Decimal(csvRow[4].split(" ")[0])
  const symbol = ticker.split("_")[0]
  const baseSymbol = ticker.split("_")[1]
  const total = new Decimal(csvRow[5].split(" ")[0])

  return {
    amount,
    baseSymbol,
    datetime: csvRow[1],
    fee: csvRow[6],
    filledPrice,
    id: index,
    role: csvRow[7] as TradeRole,
    side: csvRow[2] as TradeSide,
    symbol,
    total,
  }
}
