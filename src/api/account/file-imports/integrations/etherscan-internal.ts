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
  const columns = csvRow
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map((column) => column.replaceAll('"', ""))
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
  const valueIn = columns[10].replaceAll(",", "")
  const valueOut = columns[11].replaceAll(",", "")
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

  const assetId = "ethereum:0x0000000000000000000000000000000000000000:ETH"
  const wallet = valueIn === "0" ? parentTxFrom : txTo

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
      assetId,
      change,
      changeN,
      importId: fileImportId,
      importIndex: index,
      integration,
      operation,
      timestamp,
      txId,
      wallet,
    })

    // Fix for WETH: withdrawals do not appear in the erc20 export
    if (from === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") {
      logs.push({
        _id: `${txId}_1`,
        assetId: "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2:WETH",
        change: `-${valueIn}`,
        changeN: parseFloat(`-${valueIn}`),
        importId: fileImportId,
        importIndex: index + 0.1,
        integration,
        operation: "Withdraw",
        timestamp,
        txId,
        wallet,
      })
    }
  }

  let fee: string | undefined, feeN: number | undefined

  const tx: Transaction = {
    _id: txId,
    fee,
    feeAsset: assetId,
    feeN,
    importId: fileImportId,
    importIndex: index,
    incoming: valueIn,
    incomingAsset: assetId,
    incomingN: parseFloat(valueIn),
    integration,
    outgoing: valueOut,
    outgoingAsset: assetId,
    outgoingN: parseFloat(valueOut),
    // price,
    // priceN,
    // role,
    timestamp,
    type,
    wallet,
    ...txMeta,
  }

  // WETH
  if (logs.length === 2) {
    tx.type = "Unwrap"
    tx.outgoingAsset = logs[1].assetId
    tx.outgoing = valueIn
    tx.outgoingN = parseFloat(valueIn)
  }

  return { logs, txns: [tx] }
}
