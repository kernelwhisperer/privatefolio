import { proxy } from "comlink"

import { FileImport } from "../interfaces"
import { parseCsv } from "../utils/csv-utils"
import { hashString } from "../utils/utils"
import { auditLogsDB, fileImportsDB, transactionsDB } from "./database"

export async function processFileImport(_id: string, file: File) {
  // parse file
  const text = await file.text()
  const { metadata, logs, transactions } = await parseCsv(text, _id)

  // save logs
  await auditLogsDB.bulkDocs(logs)

  // save transactions
  await transactionsDB.bulkDocs(transactions)

  // save metadata
  const fileImport = await fileImportsDB.get(_id)
  fileImport.meta = metadata
  await fileImportsDB.put<FileImport>(fileImport)
}

export async function addFileImport(file: File) {
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

  return _id
}

export async function getFileImports() {
  const res = await fileImportsDB.allDocs<FileImport>({
    include_docs: true,
  })
  return res.rows.map((row) => row.doc) as FileImport[]
}

export async function removeFileImport(fileImport: FileImport) {
  // Audit logs
  const logs = await auditLogsDB.allDocs({
    // Prefix search
    // https://pouchdb.com/api.html#batch_fetch
    endkey: `${fileImport._id}\ufff0`,
    startkey: fileImport._id,
  } as PouchDB.Core.AllDocsWithinRangeOptions)

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
