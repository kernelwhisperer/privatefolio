/* eslint-disable sort-keys-fix/sort-keys-fix */
import { proxy } from "comlink"

import { AuditLog } from "../../interfaces"
import { ProgressCallback } from "../../stores/task-store"
import { AccountDatabase, main } from "../database"

const _filterOrder = ["integration", "wallet", "operation", "symbol"]
const _filterOrderBySpecificity = ["symbol", "operation", "wallet", "integration"]

export async function indexAuditLogs(progress: ProgressCallback, account: AccountDatabase = main) {
  progress([0, "Audit logs: cleaning up stale indexes"])
  await account.auditLogsDB.viewCleanup()
  progress([10, "Audit logs: updating index for 'timestamp'"])
  await account.auditLogsDB.createIndex({
    index: {
      fields: ["timestamp"],
      name: "timestamp",
    },
  })
  progress([20, "Audit logs: updating index for 'integration'"])
  await account.auditLogsDB.createIndex({
    index: {
      fields: ["integration", "timestamp", "wallet", "operation", "symbol"], // MUST respect the order in _filterOrder
      name: "integration",
    },
  })
  progress([30, "Audit logs: updating index for 'wallet'"])
  await account.auditLogsDB.createIndex({
    index: {
      fields: ["wallet", "timestamp", "integration", "operation", "symbol"], // MUST respect the order in _filterOrder
      name: "wallet",
    },
  })
  progress([40, "Audit logs: updating index for 'operation'"])
  await account.auditLogsDB.createIndex({
    index: {
      fields: ["operation", "timestamp", "integration", "wallet", "symbol"], // MUST respect the order in _filterOrder
      name: "operation",
    },
  })
  progress([50, "Audit logs: updating index for 'symbol'"])
  await account.auditLogsDB.createIndex({
    index: {
      fields: ["symbol", "timestamp", "integration", "wallet", "operation"], // MUST respect the order in _filterOrder
      name: "symbol",
    },
  })
}

type FindAuditLogsRequest = {
  fields?: string[]
  filters?: Partial<Record<keyof AuditLog, string | number>>
  limit?: number
  /**
   * orderBy = timestamp, always
   *
   * @default "desc"
   */
  order?: "asc" | "desc"
  skip?: number
}

export async function findAuditLogs(
  request: FindAuditLogsRequest = {},
  account: AccountDatabase = main
) {
  const { indexes } = await account.auditLogsDB.getIndexes()
  if (indexes.length === 1) {
    await indexAuditLogs(console.log)
  }

  const { filters = {}, limit, skip, order = "desc", fields } = request

  // Algorithm to help PouchDB find the best index to use
  const preferredFilter = _filterOrderBySpecificity.find((x) => filters[x])

  const selector: PouchDB.Find.Selector = !preferredFilter
    ? { timestamp: { $exists: true } }
    : {
        [preferredFilter]: filters[preferredFilter],
        timestamp: { $exists: true },
      }

  if (preferredFilter) {
    _filterOrder.forEach((filter) => {
      if (filter === preferredFilter) return
      selector[filter] = filters[filter] ? filters[filter] : { $exists: true }
    })
  }

  const sort: PouchDB.Find.FindRequest<AuditLog>["sort"] = !preferredFilter
    ? [{ timestamp: order }]
    : [{ [preferredFilter]: order }, { timestamp: order }]

  const _req: PouchDB.Find.FindRequest<AuditLog> = {
    fields,
    limit,
    selector,
    skip,
    sort,
  }
  // console.log("📜 LOG > findAuditLogs > _req:", _req)
  // const explain = await (auditLogsDB as any).explain(_req)
  // console.log("📜 LOG > findAuditLogs > explain:", explain.index)

  //
  const { docs, warning } = await account.auditLogsDB.find(_req)
  if (warning) console.warn("findAuditLogs", warning)
  return docs as AuditLog[]
}

export async function countAuditLogs(account: AccountDatabase = main) {
  const indexes = await account.auditLogsDB.allDocs({
    include_docs: false,
    // Prefix search
    // https://pouchdb.com/api.html#batch_fetch
    endkey: `_design\ufff0`,
    startkey: "_design",
  })
  const result = await account.auditLogsDB.allDocs({ include_docs: false, limit: 1 })
  return result.total_rows - indexes.rows.length
}

export function subscribeToAuditLogs(callback: () => void, account: AccountDatabase = main) {
  const changesSub = account.auditLogsDB
    .changes({
      live: true,
      since: "now",
    })
    .on("change", callback)

  return proxy(() => {
    try {
      changesSub.cancel()
    } catch {}
  })
}
