import Big from "big.js"
import spamTokens from "src/config/spam-tokens.json"
import { AuditLog, AuditLogOperation, Connection, ParserResult } from "src/interfaces"

import { Erc20Transaction } from "../etherscan-rpc"

export function parseERC20(
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
  if (value === "0") {
    return { logs: [] }
  }
  if (contractAddress in spamTokens) {
    return { logs: [] }
  }
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
    .toFixed()
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
