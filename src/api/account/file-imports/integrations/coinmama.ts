import { AuditLog, AuditLogOperation, ParserResult, Transaction } from "src/interfaces"
import { FileImportParser, Integration } from "src/settings"
import { asUTC } from "src/utils/formatting-utils"
import { hashString } from "src/utils/utils"

export const Identifier = FileImportParser.coinmama
export const integration: Integration = "coinmama"

export const HEADER = "Transaction, Type,	Amount,	Date Created,	Status"

export function parser(csvRow: string, index: number, fileImportId: string): ParserResult {
  const row = csvRow.replaceAll('"', "")
  const columns = row.split(",")
  //
  const transaction = columns[0].replaceAll(
    "Buy (Credit or Debit Card)",
    "Buy with Credit Card"
  ) as AuditLogOperation
  const type = columns[1].trim()
  const amount = columns[2].trim()
  const dateCreated = `${columns[3]} ${columns[4]}`
  const status = columns[5].trim()
  //
  if (status !== "Completed") {
    return { logs: [] }
  }
  //
  const hash = hashString(`${index}_${csvRow}`)
  const txId = `${fileImportId}_${hash}`
  const timestamp = asUTC(new Date(dateCreated))
  if (isNaN(timestamp)) {
    throw new Error(`Invalid timestamp: ${dateCreated}`)
  }
  const incoming = type.split(" ")[0]
  const incomingN = parseFloat(incoming)
  const incomingSymbol = type.split(" ")[1]
  const outgoing = amount.split(" ")[0]
  const outgoingN = parseFloat(outgoing)
  const outgoingSymbol = amount.split(" ")[1]
  const symbol = type.split(" ")[1]
  const wallet = "Spot"
  const priceN = outgoingN / incomingN
  const price = String(priceN)

  const tx: Transaction = {
    _id: txId,
    // fee,
    // feeN,
    // feeSymbol,
    incoming,
    incomingN,
    incomingSymbol,
    integration,
    outgoing,
    outgoingN,
    outgoingSymbol,
    price,
    priceN,
    timestamp,
    type: "Buy",
    wallet,
  }

  const logs: AuditLog[] = [
    {
      _id: `${txId}_0`,
      change: incoming,
      changeN: incomingN,
      integration,
      operation: transaction as AuditLogOperation,
      symbol,
      timestamp,
      wallet,
    },
  ]

  return { logs, txns: [tx] }
}
