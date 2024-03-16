import { AuditLog, BalanceMap, EtherscanTransaction, PlatformId, Transaction } from "src/interfaces"

export function trimTxId(fullId: string, platform: PlatformId): string {
  const parts = fullId.split("_")

  // Example "1682669678_0xb41d6819932845278e7c451400f1778a952b35c6358dc51b49436438753f5113_NORMAL_0"
  const trimmedId =
    platform === "ethereum" ? [parts[1], parts[2]].join("_") : parts.slice(1).join("_")

  return trimmedId
}

export function trimAuditLogId(fullId: string, platform: PlatformId): string {
  const parts = fullId.split("_")

  // Example "1682669678_0xb41d6819932845278e7c451400f1778a952b35c6358dc51b49436438753f5113_NORMAL_0_VALUE_0"
  const trimmedId =
    platform === "ethereum" ? [parts[1], parts[2], parts[4]].join("_") : parts.slice(1).join("_")

  return trimmedId
}

export function sanitizeAuditLog(auditLog: AuditLog): Partial<AuditLog> {
  const {
    _rev,
    _id: fullId,
    importId: _importId,
    importIndex: _importIndex,
    txId: fullTxId,
    ...rest
  } = auditLog

  const _id = trimAuditLogId(fullId, auditLog.platform)
  const txId = fullTxId ? trimTxId(fullTxId, auditLog.platform) : undefined

  return {
    _id,
    txId,
    ...rest,
  }
}

export function normalizeTransaction(
  transaction: Transaction | EtherscanTransaction
): Partial<Transaction> {
  // const { ...rest } = transaction as EtherscanTransaction
  return sanitizeTransaction(transaction)
}

export function sanitizeTransaction(transaction: Transaction): Partial<Transaction> {
  const {
    _rev,
    _id: _fullId,
    importId: _importId,
    importIndex: _importIndex,
    ...rest
  } = transaction

  const _id = trimTxId(transaction._id, transaction.platform)

  return {
    _id,
    ...rest,
  }
}

export function sanitizeBalance(balance: BalanceMap): Partial<BalanceMap> {
  const { _rev, _id, ...rest } = balance
  return rest
}

export function sortTransactions(a: Transaction, b: Transaction) {
  const delta = b.timestamp - a.timestamp

  if (delta === 0) {
    return trimTxId(a._id, a.platform).localeCompare(trimTxId(b._id, b.platform))
  }

  return delta
}
