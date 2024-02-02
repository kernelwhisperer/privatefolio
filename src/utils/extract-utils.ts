import { groupBy } from "lodash-es"
import { ParserId } from "src/settings"

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

/**
 * @warn This function mutates the logs param
 */
export function extractTransactions(
  logs: AuditLog[],
  fileImportId: string,
  parserId: ParserId
): Transaction[] {
  const transactions: Transaction[] = []

  if (parserId !== "binance-account-statement") {
    return transactions
  }

  const timestampGroups = groupBy(logs, "timestamp")

  for (const i in timestampGroups) {
    const group = timestampGroups[i]

    if (validGrouping(group)) {
      const wallet = group[0].wallet
      const platform = group[0].platform
      const timestamp = group[0].timestamp
      //
      const hash = hashString(`${timestamp}`)
      const _id = `${fileImportId}_${hash}`
      // Incoming
      const buyLogs = group.filter((log) => log.operation === "Buy")
      const incomingAsset: string | undefined = buyLogs[0]?.assetId
      const incomingN = incomingAsset
        ? buyLogs.reduce((acc, log) => acc + log.changeN, 0)
        : undefined
      const incoming = incomingAsset ? String(incomingN) : undefined
      // Outgoing
      const sellLogs = group.filter((log) => log.operation === "Sell")
      const outgoingAsset: string | undefined = sellLogs[0]?.assetId
      const outgoingN = outgoingAsset
        ? Math.abs(sellLogs.reduce((acc, log) => acc + log.changeN, 0))
        : undefined
      const outgoing = outgoingAsset ? String(outgoingN) : undefined
      // Fee
      const feeLogs = group.filter((log) => log.operation === "Fee")
      const feeN = Math.abs(feeLogs.reduce((acc, log) => acc + log.changeN, 0))
      const fee = String(feeN)
      const feeAsset = feeLogs[0]?.assetId
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
        feeAsset,
        feeN,
        importId: fileImportId,
        importIndex: parseInt(i),
        incoming,
        incomingAsset,
        incomingN,
        outgoing,
        outgoingAsset,
        outgoingN,
        platform,
        price,
        priceN,
        timestamp,
        type,
        wallet,
      })

      // update audit logs with txId
      for (const log of group) {
        log.txId = _id
      }
    }
  }
  return transactions
}
