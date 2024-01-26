import { AuditLogOperation, BinanceAuditLog, ParserResult } from "src/interfaces"
import { Integration, ParserId } from "src/settings"
import { asUTC } from "src/utils/formatting-utils"
import { hashString } from "src/utils/utils"

export const Identifier: ParserId = "binance"
export const integration: Integration = "binance"

export const HEADERS = [
  '"User_ID","UTC_Time","Account","Operation","Coin","Change","Remark"',
  "User_ID,UTC_Time,Account,Operation,Coin,Change,Remark",
]

export function parser(csvRow: string, index: number, fileImportId: string): ParserResult {
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
  const timestamp = asUTC(new Date(utcTime))
  const changeN = parseFloat(change)
  const symbol = coin
  const wallet = account

  const log: BinanceAuditLog = {
    _id,
    account,
    change,
    changeN,
    coin,
    integration,
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
