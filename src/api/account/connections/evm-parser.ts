import Big from "big.js"
import {
  AuditLog,
  AuditLogOperation,
  Connection,
  EtherscanTransaction,
  ParserResult,
  TransactionType,
} from "src/interfaces"

import { Erc20Transaction, NativeTransaction } from "./etherscan-rpc"

export function parser(
  row: NativeTransaction,
  index: number,
  connection: Connection
): ParserResult {
  const { platform, address } = connection
  //
  const {
    to,
    value,
    hash: txHash,
    isError,
    gasUsed,
    timeStamp: time,
    // blockNumber,
    contractAddress,
    // from,
    // gas,
    // input,
  } = row
  // console.log(txMeta)
  //
  const timestamp = new Date(Number(time) * 1000).getTime()
  if (isNaN(timestamp)) {
    throw new Error(`Invalid timestamp: ${time}`)
  }
  if (BigInt(value) === 0n || isError === "1") {
    return {
      logs: [],
      txns: [],
    }
  }
  const wallet = address.toLowerCase()
  const txId = `${connection._id}_${txHash}`
  const assetId = "ethereum:0x0000000000000000000000000000000000000000:ETH"
  let type: TransactionType
  const operation: AuditLogOperation = to?.toLowerCase() === wallet ? "Deposit" : "Withdraw"

  let incoming: string | undefined, incomingAsset: string | undefined, incomingN: number | undefined
  let outgoing: string | undefined, outgoingAsset: string | undefined, outgoingN: number | undefined

  if (operation === "Deposit") {
    incoming = new Big(value).div(1e18).toString()
    incomingN = parseFloat(incoming)
    incomingAsset = assetId
  } else {
    outgoing = new Big(value).div(1e18).toString()
    outgoingN = parseFloat(outgoing)
    outgoingAsset = assetId
  }

  const logs: AuditLog[] = []

  // TODO
  // if (operation === "Smart Contract Interaction") {
  //   type = "Unknown"
  // } else {
  // eslint-disable-next-line prefer-const
  type = operation
  const change = (operation === "Deposit" ? incoming : `-${outgoing}`) as string
  const changeN = parseFloat(change)

  logs.push({
    _id: `${txId}_VALUE_0`,
    assetId,
    change,
    changeN,
    importId: connection._id,
    importIndex: index,
    operation,
    platform,
    timestamp,
    txId,
    wallet,
  })
  // }

  let fee: string | undefined, feeAsset: string | undefined, feeN: number | undefined

  if (operation === "Withdraw" && "gasPrice" in row) {
    fee = new Big(gasUsed).mul(row.gasPrice).div(1e18).mul(-1).toString()
    feeN = parseFloat(fee)
    feeAsset = assetId

    logs.push({
      _id: `${txId}_FEE_0`,
      assetId,
      change: fee,
      changeN: feeN,
      importId: connection._id,
      importIndex: index + 0.1,
      operation: "Fee",
      platform,
      timestamp,
      txId,
      wallet,
    })
  }

  const tx: EtherscanTransaction = {
    _id: txId,
    contractAddress: contractAddress || undefined,
    fee,
    feeAsset,
    feeN,
    importId: connection._id,
    importIndex: index,
    incoming: incoming === "0" ? undefined : incoming,
    incomingAsset: incoming === "0" ? undefined : incomingAsset,
    incomingN: incoming === "0" ? undefined : incomingN,
    outgoing: outgoing === "0" ? undefined : outgoing,
    outgoingAsset: outgoing === "0" ? undefined : outgoingAsset,
    outgoingN: outgoing === "0" ? undefined : outgoingN,
    platform,
    // price,
    // priceN,
    // role,
    timestamp,
    txHash,
    type,
    wallet,
  }

  return {
    logs,
    txns: [tx],
  }
}

export function erc20Parser(
  row: Erc20Transaction,
  index: number,
  connection: Connection
): ParserResult {
  const { platform, address } = connection
  //
  const {
    contractAddress,
    timeStamp: time,
    tokenSymbol: symbol,
    tokenDecimal,
    to,
    value,
    hash: txHash,
  } = row
  //
  const timestamp = new Date(Number(time) * 1000).getTime()
  if (isNaN(timestamp)) {
    throw new Error(`Invalid timestamp: ${time}`)
  }
  const wallet = address.toLowerCase()
  const operation: AuditLogOperation = to?.toLowerCase() === wallet ? "Deposit" : "Withdraw"
  const decimals = Number(tokenDecimal)
  const change = new Big(value)
    .div(10 ** decimals)
    .mul(operation === "Deposit" ? 1 : -1)
    .toString()
  const changeN = parseFloat(change)
  const _id = `${connection._id}_${txHash}_ERC20_${index}`

  const logs: AuditLog[] = [
    {
      _id,
      assetId: `ethereum:${contractAddress}:${symbol}`,
      change,
      changeN,
      importId: connection._id,
      importIndex: index,
      operation,
      platform,
      timestamp,
      wallet,
    },
  ]

  return {
    logs,
    txns: [],
  }
}
