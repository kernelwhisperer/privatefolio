import { AuditLog, BalanceMap, EtherscanTransaction, Transaction } from "src/interfaces"

export function sanitizeAuditLog(auditLog: AuditLog): Partial<AuditLog> {
  const {
    _rev,
    _id: fullId,
    importId: _importId,
    importIndex: _importIndex,
    txId: fullTxId,
    ...rest
  } = auditLog

  const importId = "$importId"
  const _id = `${importId}_${fullId.split("_").slice(1).join("_")}`
  const txId = fullTxId ? `${importId}_${fullTxId.split("_").slice(1).join("_")}` : undefined

  return {
    _id,
    ...rest,
    importId,
    txId,
  }
}

export function normalizeTransaction(
  transaction: Transaction | EtherscanTransaction
): Partial<Transaction> {
  const { method: _method, ...rest } = transaction as EtherscanTransaction
  return sanitizeTransaction(rest)
}

export function sanitizeTransaction(transaction: Transaction): Partial<Transaction> {
  const { _rev, _id: fullId, importId: _importId, importIndex: _importIndex, ...rest } = transaction

  const importId = "$importId"
  const _id = `${importId}_${fullId.split("_").slice(1).join("_")}`

  return {
    _id,
    ...rest,
    importId,
  }
}

export function sanitizeBalance(balance: BalanceMap): Partial<BalanceMap> {
  const { _rev, _id, ...rest } = balance
  return rest
}
