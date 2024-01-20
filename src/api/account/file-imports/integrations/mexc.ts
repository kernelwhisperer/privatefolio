import {
  AuditLog,
  ParserResult,
  Transaction,
  TransactionRole,
  TransactionSide,
} from "src/interfaces"
import { Integration, ParserId } from "src/settings"
import { TZ_OFFSET } from "src/utils/formatting-utils"
import { hashString } from "src/utils/utils"

export const Identifier: ParserId = "mexc"
export const integration: Integration = "mexc"

export const HEADER = "Pairs,Time,Side,Filled Price,Executed Amount,Total,Fee,Role"

export function parser(csvRow: string, index: number, fileImportId: string): ParserResult {
  const columns = csvRow.split(",")
  //
  const marketPair = columns[0]
  const symbol = marketPair.split("_")[0]
  const quoteSymbol = marketPair.split("_")[1]
  const timestamp = new Date(columns[1]).getTime() - TZ_OFFSET
  //
  const side = columns[2] as TransactionSide
  const price = columns[3]
  const amount = columns[4]
  const total = columns[5]
  const fee = columns[6]
  const role = columns[7] as TransactionRole
  //
  const hash = hashString(`${index}_${csvRow}`)
  const txId = `${fileImportId}_${hash}`
  const amountN = parseFloat(amount)
  const priceN = parseFloat(price)
  const feeN = parseFloat(fee)
  const totalN = parseFloat(total)
  const feeSymbol = quoteSymbol // ?
  //
  const wallet = "Spot"

  const txns: Transaction[] = []

  const logs: AuditLog[] = []

  if (side === "BUY") {
    txns.push({
      _id: txId,
      fee,
      feeN,
      feeSymbol,
      incoming: amount,
      incomingN: amountN,
      incomingSymbol: symbol,
      integration,
      outgoing: total,
      outgoingN: totalN,
      outgoingSymbol: quoteSymbol,
      price,
      priceN,
      role,
      timestamp,
      type: "Buy",
      wallet,
    })
    logs.push({
      _id: `${txId}_0`,
      change: `-${total}`,
      changeN: parseFloat(`-${total}`),
      integration,
      operation: "Sell",
      symbol: quoteSymbol,
      timestamp,
      wallet,
    })
    logs.push({
      _id: `${txId}_1`,
      change: amount,
      changeN: parseFloat(amount),
      integration,
      operation: "Buy",
      symbol,
      timestamp,
      wallet,
    })
  } else {
    // SIDE === "SELL"
    txns.push({
      _id: txId,
      fee,
      feeN,
      feeSymbol,
      incoming: total,
      incomingN: totalN,
      incomingSymbol: quoteSymbol,
      integration,
      outgoing: amount,
      outgoingN: amountN,
      outgoingSymbol: symbol,
      price,
      priceN,
      role,
      timestamp,
      type: "Sell",
      wallet,
    })
    logs.push({
      _id: `${txId}_0`,
      change: `-${amount}`,
      changeN: parseFloat(`-${amount}`),
      integration,
      operation: "Sell",
      symbol,
      timestamp,
      wallet,
    })
    logs.push({
      _id: `${txId}_1`,
      change: total,
      changeN: parseFloat(total),
      integration,
      operation: "Buy",
      symbol: quoteSymbol,
      timestamp,
      wallet,
    })
  }

  logs.push({
    _id: `${txId}_2`,
    change: `-${fee}`,
    changeN: parseFloat(`-${fee}`),
    integration,
    operation: "Fee",
    symbol: quoteSymbol,
    timestamp,
    wallet,
  })

  return { logs, txns }
}
