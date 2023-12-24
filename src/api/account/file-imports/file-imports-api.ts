import { proxy } from "comlink"
import { FileImport } from "src/interfaces"
import { ProgressCallback } from "src/stores/task-store"
import { hashString, noop } from "src/utils/utils"

import { getAccount } from "../../database"
import { parseCsv } from "./csv-utils"

export async function addFileImport(
  file: File,
  progress: ProgressCallback = noop,
  accountName = "main"
) {
  const account = getAccount(accountName)
  const { name, type, lastModified, size } = file

  if (type !== "text/csv") {
    throw new Error("Error reading file: not .csv")
  }

  const timestamp = new Date().getTime()
  const _id = hashString(`${name}_${size}_${lastModified}`)

  await account.fileImportsDB.put({
    _id,
    lastModified,
    name,
    size,
    timestamp,
  } as unknown as FileImport)

  // parse file
  const text = await file.text()
  const { metadata, logs, transactions } = await parseCsv(text, _id, progress)

  // save logs
  progress([60, `Saving ${logs.length} audit logs to disk`])
  await account.auditLogsDB.bulkDocs(logs)

  // save transactions
  progress([80, `Saving ${transactions.length} transactions to disk`])
  await account.transactionsDB.bulkDocs(transactions)

  // save metadata
  const fileImport = await account.fileImportsDB.get(_id)
  fileImport.meta = metadata
  await account.fileImportsDB.put<FileImport>(fileImport)

  return { _id, metadata }
}

export async function getFileImports(accountName = "main") {
  const account = getAccount(accountName)
  const res = await account.fileImportsDB.allDocs<FileImport>({
    include_docs: true,
  })
  return res.rows.map((row) => row.doc) as FileImport[]
}

export async function removeFileImport(
  fileImport: FileImport,
  progress: ProgressCallback,
  accountName = "main"
) {
  const account = getAccount(accountName)
  // TODO consider pagination
  const logs = await account.auditLogsDB.allDocs({
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

  await account.auditLogsDB.bulkDocs(
    logs.rows.map((row) => ({ _deleted: true, _id: row.id, _rev: row.value.rev } as never))
  )
  // Transactions
  const txns = await account.transactionsDB.allDocs({
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

  await account.transactionsDB.bulkDocs(
    txns.rows.map((row) => ({ _deleted: true, _id: row.id, _rev: row.value.rev } as never))
  )

  const res = await account.fileImportsDB.remove(fileImport)
  return res.ok
}

export function subscribeToFileImports(callback: () => void, accountName = "main") {
  const account = getAccount(accountName)
  const changesSub = account.fileImportsDB
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
