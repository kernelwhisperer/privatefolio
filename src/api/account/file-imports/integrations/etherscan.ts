import { AuditLogOperation, EtherscanAuditLog, ParserResult, Transaction } from "src/interfaces"
import { FileImportParser, Integration } from "src/settings"
import { asUTC } from "src/utils/formatting-utils"
import { hashString } from "src/utils/utils"

export const Identifier = FileImportParser.etherscan
export const integration: Integration = "ethereum"

export const HEADER =
  '"Txhash","Blockno","UnixTimestamp","DateTime (UTC)","From","To","ContractAddress","Value_IN(ETH)","Value_OUT(ETH)","CurrentValue","TxnFee(ETH)","TxnFee(USD)","Historical $Price/Eth","Status","ErrCode","Method"'

export function parser(csvRow: string, index: number, fileImportId: string): ParserResult {
  const row = csvRow.replaceAll('"', "")
  const columns = row.split(",")
  //
  const txHash = columns[0]
  const blockNumber = columns[1]
  const unixTimestamp = columns[2]
  // const datetimeUtc = columns[3]
  const from = columns[4]
  const to = columns[5]
  const contractAddress = columns[6]
  const valueIn = columns[7]
  const valueOut = columns[8]
  const ethCurrentValue = columns[9]
  const txnFee = columns[10]
  const txnFeeUsd = columns[11]
  const ethHistoricalPrice = columns[12]
  const status = columns[13]
  const errorCode = columns[14]
  const method = columns[15].trim()

  const txMeta = {
    blockNumber,
    contractAddress,
    errorCode,
    ethCurrentValue,
    ethHistoricalPrice,
    from,
    method,
    status,
    to,
    txHash,
    txnFee,
    txnFeeUsd,
    // valueIn,
    // valueOut,
  }
  //
  const hash = hashString(`${index}_${csvRow}`)
  const txId = `${fileImportId}_${hash}`
  const timestamp = asUTC(new Date(Number(unixTimestamp) * 1000))

  if (valueIn === "0" && valueOut === "0") {
    throw new Error("Cannot parse etherscan tx")
  }

  const operation: AuditLogOperation = valueOut === "0" && valueIn !== "0" ? "Deposit" : "Withdraw"
  const change = operation === "Deposit" ? valueIn : `-${valueOut}`
  const changeN = parseFloat(change)
  const symbol = "ETH"
  const wallet = "Spot"

  const logs: EtherscanAuditLog[] = [
    {
      _id: `${txId}_0`,
      change,
      changeN,
      integration,
      operation,
      symbol,
      timestamp,
      txId,
      wallet,
    },
  ]

  let fee: string | undefined, feeN: number | undefined

  if (txnFee !== "0" && valueIn === "0") {
    fee = `-${txnFee}`
    feeN = parseFloat(fee)

    logs.push({
      _id: `${txId}_1`,
      change: fee,
      changeN: feeN,
      integration,
      operation: "Fee",
      symbol,
      timestamp,
      txId,
      wallet,
    })
  }

  const tx: Transaction = {
    _id: txId,
    fee,
    feeN,
    feeSymbol: symbol,
    incoming: valueIn,
    incomingN: parseFloat(valueIn),
    incomingSymbol: symbol,
    integration,
    outgoing: valueOut,
    outgoingN: parseFloat(valueOut),
    outgoingSymbol: symbol,
    // price,
    // priceN,
    // role,
    timestamp,
    type: operation,
    wallet,
    ...txMeta,
  }

  return { logs, txns: [tx] }
}
