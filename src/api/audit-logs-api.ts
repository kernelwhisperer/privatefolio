import { AuditLog } from "../interfaces"
import { ActiveFilterMap } from "../stores/audit-log-store"
import { auditLogsDB } from "./database"

/**
 * Retrieves audit logs from the database.
 *
 * @warning Unsorted.
 */
export async function getAuditLogs(filters: ActiveFilterMap = {}) {
  console.log("📜 LOG > getAuditLogs > filters:", filters)
  const { docs, warning } = await auditLogsDB.find({
    // attachments: true,
    // descending: true,
    // include_docs: true,
    selector: filters,
  })

  if (warning) console.warn(warning)

  return docs as AuditLog[]
  // return res.rows.map((row) => row.doc)
}
