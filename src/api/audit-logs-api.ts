import { AuditLog } from "../interfaces"
import { ActiveFilterMap } from "../stores/audit-log-store"
import { auditLogsDB } from "./database"

/**
 * Retrieves audit logs from the database.
 *
 * @warning Unsorted.
 */
export async function getAuditLogs(filters: ActiveFilterMap = {}) {
  await auditLogsDB.createIndex({
    index: {
      fields: ["symbol"],
    },
  })
  await auditLogsDB.createIndex({
    index: {
      fields: ["operation"],
    },
  })

  const res2 = await auditLogsDB.allDocs({ include_docs: false })
  console.log("📜 LOG > getAuditLogs > res2:", res2)

  const result = await auditLogsDB.find({
    limit: 25,
    // attachments: true,
    // descending: true,
    // include_docs: true,
    selector: filters,
    sort: [{ symbol: "desc" }],
  })
  const { docs, warning } = result
  console.log("📜 LOG > getAuditLogs > result:", result)

  if (warning) console.warn(warning)

  return docs as AuditLog[]
  // return res.rows.map((row) => row.doc)
}
