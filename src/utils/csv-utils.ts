import Decimal from "decimal.js"

import { AuditLog, AuditLogOperation, BinanceAuditLog } from "../interfaces"
import { TZ_OFFSET } from "./client-utils"
import { hashString } from "./utils"

type Parser = (csvRow: string, index: number) => AuditLog

// export function mexcParser(csvRow: string[], index: number): AuditLog {
//   const marketPair = csvRow[0]
//   const filledPriceBN = new Decimal(csvRow[3].split(" ")[0])
//   const amountBN = new Decimal(csvRow[4].split(" ")[0])
//   const symbol = marketPair.split("_")[0]
//   const quoteSymbol = marketPair.split("_")[1]
//   const totalBN = new Decimal(csvRow[5].split(" ")[0])
//   const feeBN = new Decimal(csvRow[6])
//   // const fee = new Decimal(csvRow[6].split(" ")[0])
//   // const feeSymbol = csvRow[6].split(" ")[1]
//   const side = csvRow[2] as TransactionSide
//   const timestamp = new Date(csvRow[1]).getTime() - TZ_OFFSET

//   return {
//     amount: amountBN.toNumber(),
//     amountBN,
//     exchange: "mexc",
//     fee: feeBN.toNumber(),
//     feeBN,
//     feeSymbol: quoteSymbol,
//     filledPrice: filledPriceBN.toNumber(),
//     filledPriceBN,
//     id: index,
//     quoteSymbol,
//     role: csvRow[7] as TransactionRole,
//     side,
//     symbol,
//     timestamp,
//     total: totalBN.toNumber(),
//     totalBN,
//     type: side === "BUY" ? "Buy" : "Sell",
//   }
// }

export function binanceParser(csvRow: string, index: number): BinanceAuditLog {
  const row = csvRow.replaceAll('"', "")
  const columns = row.split(",")
  //
  const userId = columns[0]
  const utcTime = columns[1]
  const account = columns[2]
  const operation = columns[3]
    .replace("Transaction ", "")
    .replace("Spend", "Sell") as AuditLogOperation
  const coin = columns[4]
  const change = columns[5]
  const remark = columns[6]
  //
  const id = hashString(`${index}_${csvRow}`)
  const timestamp = new Date(utcTime).getTime() - TZ_OFFSET
  const changeBN = new Decimal(change)
  const symbol = coin
  const wallet = account

  return {
    account,
    change,
    changeBN,
    coin,
    id,
    integration: "Binance",
    operation,
    remark,
    symbol,
    timestamp,
    userId,
    utcTime,
    wallet,
  }
}

const PARSERS: Record<string, Parser> = {
  '"User_ID","UTC_Time","Account","Operation","Coin","Change","Remark"': binanceParser,
  // "Pairs,Time,Side,Filled Price,Executed Amount,Total,Fee,Role": mexcParser,
}

export async function readCsv(filePath: string): Promise<AuditLog[]> {
  const response = await fetch(filePath)
  const text = await response.text()

  // Parse CSV
  const rows = text.split("\n")
  // const rows = rowsAsText.map((row) => row.split(","))

  const header = rows[0]
  const parser = PARSERS[header]

  const transactions: AuditLog[] = []

  // Skip header
  rows.slice(1).forEach((row, index) => {
    try {
      const obj = parser(row, index)
      transactions.push(obj)
    } catch {}
  })

  return transactions
}
