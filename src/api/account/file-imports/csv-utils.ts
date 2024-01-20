import { AuditLog, AuditLogOperation, FileImport, Transaction } from "src/interfaces"
import { ProgressCallback } from "src/stores/task-store"
import { extractTransactions } from "src/utils/extract-utils"

import { HEADER_MATCHER, INTEGRATION_MATCHER, PARSER_MATCHER } from "./integrations"

export async function parseCsv(
  text: string,
  _fileImportId: string,
  progress: ProgressCallback,
  parserContext: Record<string, unknown>
) {
  // Parse CSV
  const rows = text.trim().split("\n")

  const header = rows[0]
    .replace("ï»¿", "") // mexc
    .replace(/CurrentValue @ \$\d+(\.\d+)?\/Eth,?/, "CurrentValue") // etherscan
    .trim()

  const parserId = HEADER_MATCHER[header]
  const parser = PARSER_MATCHER[parserId]
  const integration = INTEGRATION_MATCHER[parserId]

  if (!parser) {
    throw new Error(`File import unsupported, unknown header: ${header}`)
  }

  const logs: AuditLog[] = []
  let transactions: Transaction[] = []
  const symbolMap: Record<string, boolean> = {}
  const walletMap: Record<string, boolean> = {}
  const operationMap: Partial<Record<AuditLogOperation, boolean>> = {}

  progress([0, `Parsing ${rows.length - 1} rows`])
  // Skip header
  rows.slice(1).forEach((row, index) => {
    try {
      if (index !== 0 && (index + 1) % 1000 === 0) {
        progress([(index * 50) / rows.length, `Parsing row ${index + 1}`])
      }
      const { logs: newLogs, txns } = parser(row, index, _fileImportId, parserContext)

      for (const log of newLogs) {
        logs.push(log)
        symbolMap[log.symbol] = true
        walletMap[log.wallet] = true
        operationMap[log.operation] = true
      }

      if (txns) {
        transactions = transactions.concat(txns)
      }
    } catch (error) {
      progress([0, `Error parsing row ${index + 1}: ${String(error)}`])
    }
  })

  progress([50, `Extracting transactions`])
  if (transactions.length === 0) {
    transactions = extractTransactions(logs, _fileImportId)
  }

  const metadata: FileImport["meta"] = {
    integration,
    logs: logs.length,
    operations: Object.keys(operationMap) as AuditLogOperation[],
    rows: rows.length - 1,
    symbols: Object.keys(symbolMap),
    transactions: transactions.length,
    wallets: Object.keys(walletMap),
  }

  return { logs, metadata, transactions }
}
