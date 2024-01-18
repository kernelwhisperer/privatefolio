import { AuditLog, AuditLogOperation, Connection, ParserResult } from "src/interfaces"
import { asUTC } from "src/utils/formatting-utils"

import { Erc20Transaction, NativeTransaction } from "./etherscan-rpc"

export function parser(
  row: NativeTransaction,
  index: number,
  connection: Connection
): ParserResult {
  if (BigInt(row.value) === 0n || row.isError === "1") {
    return {
      logs: [],
      txns: [],
    }
  }

  const { integration } = connection
  //
  const operation: AuditLogOperation =
    row.to?.toLowerCase() === connection.address.toLowerCase() ? "Deposit" : "Withdraw"

  const changeN = (Number(row.value) / 1e18) * (operation === "Deposit" ? 1 : -1)
  const change = String(changeN)
  const _id = `${connection._id}_${row.hash}_${index}`

  const time = row.timeStamp
  const timestamp = asUTC(new Date(Number(time) * 1000))

  if (isNaN(timestamp)) {
    throw new Error(`Invalid timestamp: ${row.timeStamp}`)
  }
  const logs: AuditLog[] = [
    {
      _id,
      change,
      changeN,
      integration,
      operation,
      symbol: "ETH",
      timestamp,
      wallet: "Spot",
    },
  ]

  if (operation === "Withdraw" && "gasPrice" in row) {
    const changeN = (-Number(row.gasUsed) * Number(row.gasPrice)) / 1e18
    const change = String(changeN)

    logs.push({
      _id: `${connection._id}_${row.hash}_${index}_fee`,
      change,
      changeN,
      integration,
      operation: "Fee",
      symbol: "ETH",
      timestamp,
      wallet: "Spot",
    })
  }

  return {
    logs,
    txns: [],
  }
}

export function erc20Parser(
  row: Erc20Transaction,
  index: number,
  connection: Connection
): ParserResult {
  const { integration } = connection
  //
  const operation: AuditLogOperation =
    row.to?.toLowerCase() === connection.address.toLowerCase() ? "Deposit" : "Withdraw"

  const decimals = Number(row.tokenDecimal)

  const changeN = (Number(row.value) / 10 ** decimals) * (operation === "Deposit" ? 1 : -1)
  const change = String(changeN)
  const _id = `${connection._id}_${row.hash}_${index}`

  const time = row.timeStamp
  const timestamp = asUTC(new Date(Number(time) * 1000))

  if (isNaN(timestamp)) {
    throw new Error(`Invalid timestamp: ${row.timeStamp}`)
  }
  const logs: AuditLog[] = [
    {
      _id,
      change,
      changeN,
      integration,
      operation,
      symbol: row.tokenSymbol,
      timestamp,
      wallet: "Spot",
    },
  ]

  return {
    logs,
    txns: [],
  }
}
