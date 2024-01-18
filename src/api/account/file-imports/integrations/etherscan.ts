import { AuditLogOperation, EtherscanAuditLog, Integration, ParserResult } from "src/interfaces"
import { asUTC } from "src/utils/formatting-utils"
import { hashString } from "src/utils/utils"

export const Identifier: Integration = "etherscan"

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
  //
  const hash = hashString(`${index}_${csvRow}`)
  const _id = `${fileImportId}_${hash}`
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
      _id,
      change,
      changeN,
      integration: Identifier,
      operation,
      symbol,
      timestamp,
      wallet,
      ...txMeta,
    },
  ]

  if (txnFee !== "0" && valueIn === "0") {
    logs.push({
      _id: `${fileImportId}_${hash}_fee`,
      change: `-${txnFee}`,
      changeN: parseFloat(`-${txnFee}`),
      integration: Identifier,
      operation: "Fee",
      symbol,
      timestamp,
      wallet,
      ...txMeta,
    })
  }

  return { logs }
}
