import Decimal from "decimal.js"

import { ParsedTransaction, TransactionRole, TransactionSide } from "./interfaces"

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

export function mexcParser(csvRow: string[], index: number): ParsedTransaction {
  const marketPair = csvRow[0]
  const filledPrice = new Decimal(csvRow[3].split(" ")[0])
  const amount = new Decimal(csvRow[4].split(" ")[0])
  const symbol = marketPair.split("_")[0]
  const quoteSymbol = marketPair.split("_")[1]
  const total = new Decimal(csvRow[5].split(" ")[0])
  const fee = new Decimal(csvRow[6].split(" ")[0])
  const feeSymbol = csvRow[6].split(" ")[1]

  return {
    amount,
    datetime: csvRow[1],
    fee,
    feeSymbol,
    filledPrice,
    id: index,
    quoteSymbol,
    role: csvRow[7] as TransactionRole,
    side: csvRow[2] as TransactionSide,
    symbol,
    total,
  }
}
