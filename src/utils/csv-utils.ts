import {
  AuditLog,
  AuditLogOperation,
  BinanceAuditLog,
  Integration,
  Transaction,
  TransactionRole,
  TransactionSide,
} from "../interfaces"
import { TZ_OFFSET } from "./client-utils"
import { extractTransactions } from "./extract-utils"
import { hashString } from "./utils"

type ParserResult = { logs: AuditLog[]; txns?: Transaction[] }
type Parser = (csvRow: string, index: number, fileImportId: string) => ParserResult

export function mexcParser(csvRow: string, index: number, fileImportId: string): ParserResult {
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
  const integration = "MEXC"
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

export function binanceParser(csvRow: string, index: number, fileImportId: string): ParserResult {
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
  const hash = hashString(`${index}_${csvRow}`)
  const _id = `${fileImportId}_${hash}`
  const timestamp = new Date(utcTime).getTime() - TZ_OFFSET
  const changeN = parseFloat(change)
  const symbol = coin
  const wallet = account

  const log: BinanceAuditLog = {
    _id,
    account,
    change,
    changeN,
    coin,
    integration: "Binance",
    operation,
    remark,
    symbol,
    timestamp,
    userId,
    utcTime,
    wallet,
  }

  return { logs: [log] }
}

const INTEGRATIONS: Record<string, Integration> = {
  '"User_ID","UTC_Time","Account","Operation","Coin","Change","Remark"': "Binance",
  "Pairs,Time,Side,Filled Price,Executed Amount,Total,Fee,Role": "MEXC",
}

const PARSERS: Record<Integration, Parser> = {
  Binance: binanceParser,
  MEXC: mexcParser,
}

export async function parseCsv(text: string, _fileImportId: string) {
  // Parse CSV
  const rows = text.trim().split("\n")
  // const rows = rowsAsText.map((row) => row.split(","))

  const header = rows[0].replace("ï»¿", "") // MEXC
  const integration = INTEGRATIONS[header]
  const parser = PARSERS[integration]

  const logs: AuditLog[] = []
  let transactions: Transaction[] = []
  const symbolMap: Record<string, boolean> = {}
  const walletMap: Record<string, boolean> = {}
  const operationMap: Partial<Record<AuditLogOperation, boolean>> = {}

  // Skip header
  rows.slice(1).forEach((row, index) => {
    try {
      const { logs: newLogs, txns } = parser(row, index, _fileImportId)

      for (const log of newLogs) {
        logs.push(log)
        symbolMap[log.symbol] = true
        walletMap[log.wallet] = true
        operationMap[log.operation] = true
      }

      if (txns) {
        transactions = transactions.concat(txns)
      }
    } catch {}
  })

  if (transactions.length === 0) {
    transactions = extractTransactions(logs, _fileImportId)
  }

  const metadata = {
    integration,
    logs: logs.length,
    operations: Object.keys(operationMap) as AuditLogOperation[],
    rows: rows.length - 1,
    symbols: Object.keys(symbolMap),
    transactions: transactions.length,
    wallets: Object.keys(walletMap),
  }
  console.log("CSV metadata:", metadata)

  return { logs, metadata, transactions }
}
