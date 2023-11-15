import Decimal from "decimal.js"

import { TZ_OFFSET } from "./client-utils"
import { Transaction, TransactionRole, TransactionSide } from "./interfaces"

type Parser = (input: string[], index: number) => Transaction

export function mexcParser(csvRow: string[], index: number): Transaction {
  const marketPair = csvRow[0]
  const filledPriceBN = new Decimal(csvRow[3].split(" ")[0])
  const amountBN = new Decimal(csvRow[4].split(" ")[0])
  const symbol = marketPair.split("_")[0]
  const quoteSymbol = marketPair.split("_")[1]
  const totalBN = new Decimal(csvRow[5].split(" ")[0])
  const feeBN = new Decimal(csvRow[6])
  // const fee = new Decimal(csvRow[6].split(" ")[0])
  // const feeSymbol = csvRow[6].split(" ")[1]
  const side = csvRow[2] as TransactionSide

  return {
    amount: amountBN.toNumber(),
    amountBN,
    exchange: "mexc",
    fee: feeBN.toNumber(),
    feeBN,
    feeSymbol: quoteSymbol,
    filledPrice: filledPriceBN.toNumber(),
    filledPriceBN,
    id: index,
    quoteSymbol,
    role: csvRow[7] as TransactionRole,
    side,
    symbol,
    timestamp: new Date(csvRow[1]).getTime() - TZ_OFFSET,
    total: totalBN.toNumber(),
    totalBN,
    type: side === "BUY" ? "Buy" : "Sell",
  }
}

const PARSERS: Record<string, Parser> = {
  "Pairs,Time,Side,Filled Price,Executed Amount,Total,Fee,Role": mexcParser,
  // '"User_ID","UTC_Time","Account","Operation","Coin","Change","Remark"': binanceParser
}

export async function readCsv(filePath: string): Promise<Transaction[]> {
  const response = await fetch(filePath)
  const text = await response.text()

  // Parse CSV
  const rowsAsText = text.split("\n")
  const rows = rowsAsText.map((row) => row.split(","))

  const header = rowsAsText[0]
  const parser = PARSERS[header]

  const transactions: Transaction[] = []

  // Skip header
  rows.slice(1).forEach((row, index) => {
    try {
      const obj = parser(row, index)
      transactions.push(obj)
    } catch {}
  })

  return transactions
}
