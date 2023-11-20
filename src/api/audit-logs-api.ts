import { AuditLogOperation, Integration } from "../interfaces"
import { auditLogsDB } from "./database"

export interface AuditLog {
  _id: string
  change: string
  changeN: number
  integration: Integration
  operation: AuditLogOperation
  symbol: string
  timestamp: number
  wallet: string
}

export interface BinanceAuditLog extends AuditLog {
  account: string
  coin: string
  remark: string
  userId: string
  utcTime: string
}

export async function getAuditLogs() {
  const res = await auditLogsDB.allDocs<AuditLog>({
    // attachments: true,
    // descending: true,
    include_docs: true,
  })
  return res.rows.map((row) => row.doc) as AuditLog[]
}
