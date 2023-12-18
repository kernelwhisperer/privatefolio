import { proxy } from "comlink"

import { FileImport } from "../interfaces"
import { ProgressCallback } from "../stores/task-store"
import { parseCsv } from "../utils/csv-utils"
import { hashString } from "../utils/utils"
import { auditLogsDB, fileImportsDB, transactionsDB } from "./database"

export async function addFileImport(file: File, progress: ProgressCallback) {
  const { name, type, lastModified, size } = file

  if (type !== "text/csv") {
    throw new Error("Error reading file: not .csv")
  }

  const timestamp = new Date().getTime()
  const _id = hashString(`${name}_${size}_${lastModified}`)

  await fileImportsDB.put({
    _id,
    lastModified,
    name,
    size,
    timestamp,
  })

  // parse file
  const text = await file.text()
  const { metadata, logs, transactions } = await parseCsv(text, _id, progress)

  // save logs
  progress([60, `Saving ${logs.length} audit logs to disk`])
  await auditLogsDB.bulkDocs(logs)

  // save transactions
  progress([80, `Saving ${transactions.length} transactions to disk`])
  await transactionsDB.bulkDocs(transactions)

  // save metadata
  const fileImport = await fileImportsDB.get(_id)
  fileImport.meta = metadata
  await fileImportsDB.put<FileImport>(fileImport)
}

export async function getFileImports() {
  const res = await fileImportsDB.allDocs<FileImport>({
    include_docs: true,
  })
  return res.rows.map((row) => row.doc) as FileImport[]
}

export async function removeFileImport(fileImport: FileImport, progress: ProgressCallback) {
  // TODO consider pagination
  const logs = await auditLogsDB.allDocs({
    // Prefix search
    // https://pouchdb.com/api.html#batch_fetch
    endkey: `${fileImport._id}\ufff0`,
    startkey: fileImport._id,
  } as PouchDB.Core.AllDocsWithinRangeOptions)
  progress([25, `Removing ${logs.rows.length} audit logs`])

  // await Promise.all(
  //   logs.rows.map((row) =>
  //     auditLogsDB.remove({
  //       _id: row.id,
  //       _rev: row.value.rev,
  //     })
  //   )
  // )

  await auditLogsDB.bulkDocs(
    logs.rows.map((row) => ({ _deleted: true, _id: row.id, _rev: row.value.rev } as any))
  )
  // Transactions
  const txns = await transactionsDB.allDocs({
    // Prefix search
    // https://pouchdb.com/api.html#batch_fetch
    endkey: `${fileImport._id}\ufff0`,
    startkey: fileImport._id,
  } as PouchDB.Core.AllDocsWithinRangeOptions)
  progress([50, `Removing ${txns.rows.length} transactions`])

  // await Promise.all(
  //   txns.rows.map((row) =>
  //     transactionsDB.remove({
  //       _id: row.id,
  //       _rev: row.value.rev,
  //     })
  //   )
  // )

  await transactionsDB.bulkDocs(
    txns.rows.map((row) => ({ _deleted: true, _id: row.id, _rev: row.value.rev } as any))
  )

  const res = await fileImportsDB.remove(fileImport)
  return res.ok
}

export function subscribeToFileImports(callback: () => void) {
  const changesSub = fileImportsDB
    .changes({
      live: true,
      since: "now",
    })
    .on("change", callback)

  return proxy(() => {
    try {
      // console.log("📜 LOG > subscribeToFileImports > unsubbing")
      changesSub.cancel()
    } catch {}
  })
}
