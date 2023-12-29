import { AuditLog, AuditLogOperation, Connection, ParserResult } from "src/interfaces"
import { asUTC } from "src/utils/formatting-utils"

import { BlockchainTransaction } from "./etherscan-rpc"

export function parser(
  row: BlockchainTransaction,
  _index: number,
  connection: Connection
): ParserResult {
  const { integration } = connection
  //
  const operation: AuditLogOperation =
    row.to?.toLowerCase() === connection.address.toLowerCase() ? "Deposit" : "Withdraw"

  const changeN = (Number(row.value) / 1e18) * (operation === "Deposit" ? 1 : -1)
  const change = String(changeN)
  const _id = `${connection._id}_${row.hash}`

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

  return {
    logs,
    txns: [],
  }
}
