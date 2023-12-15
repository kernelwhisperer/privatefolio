import { groupBy } from "lodash"

import { AuditLog, Transaction } from "../interfaces"
import { hashString } from "./utils"

function validGrouping(logs: AuditLog[]) {
  let hasBuy = false
  let hasSell = false
  //
  for (const log of logs) {
    if (log.operation === "Buy") {
      hasBuy = true
    }
    if (log.operation === "Sell") {
      hasSell = true
    }
    if (!["Buy", "Sell", "Fee"].includes(log.operation)) {
      // hasInvalidOperation
      return false
    }
  }

  return hasBuy && hasSell
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
      const incomingSymbol: string | undefined = buyLogs[0]?.symbol
      const incomingN = incomingSymbol
        ? buyLogs.reduce((acc, log) => acc + log.changeN, 0)
        : undefined
      const incoming = incomingSymbol ? String(incomingN) : undefined
      // Outgoing
      const sellLogs = logs.filter((log) => log.operation === "Sell")
      const outgoingSymbol: string | undefined = sellLogs[0]?.symbol
      const outgoingN = outgoingSymbol
        ? Math.abs(sellLogs.reduce((acc, log) => acc + log.changeN, 0))
        : undefined
      const outgoing = outgoingSymbol ? String(outgoingN) : undefined
      // Fee
      const feeLogs = logs.filter((log) => log.operation === "Fee")
      const feeN = Math.abs(feeLogs.reduce((acc, log) => acc + log.changeN, 0))
      const fee = String(feeN)
      const feeSymbol = feeLogs[0]?.symbol
      // Price
      const priceN =
        typeof incomingN === "number" && typeof outgoingN === "number"
          ? incomingN / outgoingN
          : undefined
      const price = typeof priceN === "number" ? String(priceN) : undefined
      //
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
