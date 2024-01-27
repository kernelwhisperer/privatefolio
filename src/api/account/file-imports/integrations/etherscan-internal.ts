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

export const Identifier: ParserId = "etherscan-internal"
export const integration: Integration = "ethereum"

export const HEADER2 =
  '"Txhash","Blockno","UnixTimestamp","DateTime (UTC)","From","To","ContractAddress","Value_IN(ETH)","Value_OUT(ETH)","CurrentValue","TxnFee(ETH)","TxnFee(USD)","Historical $Price/Eth","Status","ErrCode","Method"'
export const HEADER =
  '"Txhash","Blockno","UnixTimestamp","DateTime (UTC)","ParentTxFrom","ParentTxTo","ParentTxETH_Value","From","TxTo","ContractAddress","Value_IN(ETH)","Value_OUT(ETH)","CurrentValue","Historical $Price/Eth","Status","ErrCode","Type"'

export function parser(csvRow: string, index: number, fileImportId: string): ParserResult {
  const row = csvRow.replaceAll('"', "")
  const columns = row.split(",")
  //
  const txHash = columns[0]
  const blockNumber = columns[1]
  // const unixTimestamp = columns[2]
  const datetimeUtc = columns[3]
  const parentTxFrom = columns[4]
  const parentTxTo = columns[5]
  const parentTxEthValue = columns[6]
  const from = columns[7]
  const txTo = columns[8]
  const contractAddress = columns[9]
  const valueIn = columns[10]
  const valueOut = columns[11]
  const ethCurrentValue = columns[12]
  const ethHistoricalPrice = columns[13]
  const status = columns[14]
  const errorCode = columns[15]
  const txType = columns[17].trim()

  const txMeta = {
    blockNumber,
    contractAddress,
    errorCode,
    ethCurrentValue,
    ethHistoricalPrice,
    from,
    parentTxEthValue,
    parentTxFrom,
    parentTxTo,
    status,
    txHash,
    txTo,
    txType,
    valueIn,
    valueOut,
  }
  // console.log(txMeta)
  //
  const hash = hashString(`${index}_${csvRow}`)
  const txId = `${fileImportId}_${hash}`
  const timestamp = asUTC(new Date(datetimeUtc))

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

  // if (txnFee !== "0" && valueIn === "0") {
  //   fee = `-${txnFee}`
  //   feeN = parseFloat(fee)

  //   logs.push({
  //     _id: `${txId}_1`,
  //     change: fee,
  //     changeN: feeN,
  //     importId: fileImportId,
  //     importIndex: index + 0.1,
  //     integration,
  //     operation: "Fee",
  //     symbol,
  //     timestamp,
  //     txId,
  //     wallet,
  //   })
  // }

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
