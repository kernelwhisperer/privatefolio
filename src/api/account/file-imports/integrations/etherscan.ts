import {
  AuditLogOperation,
  EtherscanAuditLog,
  ParserResult,
  Transaction,
  TransactionType,
} from "src/interfaces"
import { Integration, ParserId } from "src/settings"
import { asUTC } from "src/utils/formatting-utils"
import { hashString } from "src/utils/utils"

export const Identifier: ParserId = "etherscan"
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
    valueIn,
    valueOut,
  }
  // console.log(txMeta)
  //
  const hash = hashString(`${index}_${csvRow}`)
  const txId = `${fileImportId}_${hash}`
  const timestamp = asUTC(new Date(Number(unixTimestamp) * 1000))

  const symbol = "ETH"
  const wallet = "Spot"

  const logs: EtherscanAuditLog[] = []
  let type: TransactionType
  const operation: AuditLogOperation =
    valueOut === "0" && valueIn !== "0"
      ? "Deposit"
      : valueIn === "0" && valueOut === "0"
      ? "Smart Contract Interaction"
      : "Withdraw"

  if (operation === "Smart Contract Interaction") {
    type = "Unknown"
  } else {
    type = operation
    const change = operation === "Deposit" ? valueIn : `-${valueOut}`
    const changeN = parseFloat(change)

    logs.push({
      _id: `${txId}_0`,
      change,
      changeN,
      importId: fileImportId,
      importIndex: index,
      integration,
      operation,
      symbol,
      timestamp,
      txId,
      wallet,
    })
  }

  let fee: string | undefined, feeN: number | undefined

  if (txnFee !== "0" && valueIn === "0") {
    fee = `-${txnFee}`
    feeN = parseFloat(fee)

    logs.push({
      _id: `${txId}_1`,
      change: fee,
      changeN: feeN,
      importId: fileImportId,
      importIndex: index + 0.1,
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
    importId: fileImportId,
    importIndex: index,
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
    type,
    wallet,
    ...txMeta,
  }

  return { logs, txns: [tx] }
}
