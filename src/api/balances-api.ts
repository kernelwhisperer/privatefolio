import { AuditLogOperation, Integration } from "../interfaces"
import { auditLogsDB } from "./database"

export interface Balance {
  _id: string
  change: string
  changeN: number
  integration: Integration
  operation: AuditLogOperation
  symbol: string
  timestamp: number
  wallet: string
}

export async function getBalances() {
  const res = await auditLogsDB.allDocs<Balance>({
    // attachments: true,
    // descending: true,
    include_docs: true,
  })
  return res.rows.map((row) => row.doc).filter((x) => x?.symbol === "ETH") as Balance[]
}
