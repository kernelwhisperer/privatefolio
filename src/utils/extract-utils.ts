import { groupBy } from "lodash"

import { AuditLog, Transaction } from "../interfaces"
import { hashString } from "./utils"

function validGrouping(logs: AuditLog[]) {
  for (const log of logs) {
    if (!["Buy", "Sell", "Fee"].includes(log.operation)) {
      return false
    }
  }
  return true
}

export function extractTransactions(logs: AuditLog[], fileImportId: string): Transaction[] {
  const transactions: Transaction[] = []

  const timestampGroups = groupBy(logs, "timestamp")

  for (const i in timestampGroups) {
    const logs = timestampGroups[i]

    if (validGrouping(logs)) {
      const wallet = logs[0].wallet
      const integration = logs[0].integration
      const timestamp = logs[0].timestamp
      //
      const hash = hashString(`${timestamp}`)
      const _id = `${fileImportId}_${hash}`
      // Incoming
      const buyLogs = logs.filter((log) => log.operation === "Buy")
      const incomingN = buyLogs.reduce((acc, log) => acc + log.changeN, 0)
      const incoming = String(incomingN)
      const incomingSymbol = buyLogs[0]?.symbol
      // Outgoing
      const sellLogs = logs.filter((log) => log.operation === "Sell")
      const outgoingN = Math.abs(sellLogs.reduce((acc, log) => acc + log.changeN, 0))
      const outgoing = String(outgoingN)
      const outgoingSymbol = sellLogs[0]?.symbol
      // Fee
      const feeLogs = logs.filter((log) => log.operation === "Fee")
      const feeN = Math.abs(feeLogs.reduce((acc, log) => acc + log.changeN, 0))
      const fee = String(feeN)
      const feeSymbol = feeLogs[0]?.symbol
      // Price
      const priceN = incomingN / outgoingN
      const price = String(priceN)
      const type = "Swap"

      transactions.push({
        _id,
        fee,
        feeN,
        feeSymbol,
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
        type,
        wallet,
      })
    }
  }
  return transactions
}
