import { AuditLog, BinanceAuditLog } from "../api/audit-logs-api"
import { AuditLogOperation, Integration } from "../interfaces"
import { TZ_OFFSET } from "./client-utils"
import { hashString } from "./utils"

type Parser = (csvRow: string, index: number, fileImportId: string) => AuditLog

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

export function binanceParser(
  csvRow: string,
  index: number,
  fileImportId: string
): BinanceAuditLog {
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

  return {
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
}

const INTEGRATIONS: Record<string, Integration> = {
  '"User_ID","UTC_Time","Account","Operation","Coin","Change","Remark"': "Binance",
  "Pairs,Time,Side,Filled Price,Executed Amount,Total,Fee,Role": "Mexc Global",
}

const PARSERS: Record<Integration, Parser> = {
  Binance: binanceParser,
  "Mexc Global": function () {
    throw new Error("Function not implemented.")
  },
}

export async function parseCsv(text: string, _fileImportId: string) {
  // Parse CSV
  const rows = text.trim().split("\n")
  // const rows = rowsAsText.map((row) => row.split(","))

  const header = rows[0]
  const integration = INTEGRATIONS[header]
  const parser = PARSERS[integration]

  const logs: AuditLog[] = []
  const symbolMap: Record<string, boolean> = {}
  const walletMap: Record<string, boolean> = {}
  const operationMap: Partial<Record<AuditLogOperation, boolean>> = {}

  // Skip header
  rows.slice(1).forEach((row, index) => {
    try {
      const obj = parser(row, index, _fileImportId)
      logs.push(obj)

      symbolMap[obj.symbol] = true
      walletMap[obj.wallet] = true
      operationMap[obj.operation] = true
    } catch {}
  })

  const metadata = {
    integration,
    logs: logs.length,
    operations: Object.keys(operationMap) as AuditLogOperation[],
    rows: rows.length - 1,
    symbols: Object.keys(symbolMap),
    wallets: Object.keys(walletMap),
  }
  console.log("📜 LOG > parseCsv > metadata:", metadata)

  return { logs, metadata }
}
