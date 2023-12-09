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
  console.log("📜 LOG > extractTransactions > timestampGroups:", timestampGroups)

  for (const i in timestampGroups) {
    const logs = timestampGroups[i]
    console.log("📜 LOG > extractTransactions > logs:", logs)

    if (validGrouping(logs)) {
      const wallet = logs[0].wallet
      const integration = logs[0].integration
      const timestamp = logs[0].timestamp
      //
      const hash = hashString(`${timestamp}`)
      const _id = `${fileImportId}_${hash}`
      // Amount
      const sellLogs = logs.filter((log) => log.operation === "Sell")
      const amountN = Math.abs(sellLogs.reduce((acc, log) => acc + log.changeN, 0))
      const amount = String(amountN)
      const symbol = sellLogs[0]?.symbol
      // Fee
      const feeLogs = logs.filter((log) => log.operation === "Fee")
      const feeN = Math.abs(feeLogs.reduce((acc, log) => acc + log.changeN, 0))
      const fee = String(feeN)
      const feeSymbol = feeLogs[0]?.symbol
      // Total
      const buyLogs = logs.filter((log) => log.operation === "Buy")
      const totalN = buyLogs.reduce((acc, log) => acc + log.changeN, 0)
      const total = String(totalN)
      const quoteSymbol = buyLogs[0]?.symbol
      // Price
      const priceN = totalN / amountN
      const price = String(priceN)
      const type = "Swap"

      transactions.push({
        _id,
        amount,
        amountN,
        fee,
        feeN,
        feeSymbol,
        integration,
        price,
        priceN,
        quoteSymbol,
        symbol,
        timestamp,
        total,
        totalN,
        type,
        wallet,
      })
    }
  }
  return transactions
}
