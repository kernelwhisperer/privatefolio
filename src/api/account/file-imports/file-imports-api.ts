import { proxy } from "comlink"
import { FileImport, ParserContextFn, Timestamp } from "src/interfaces"
import { ProgressCallback } from "src/stores/task-store"
import { formatDate } from "src/utils/formatting-utils"
import { hashString, noop } from "src/utils/utils"

import { getAccount } from "../../database"
import { invalidateBalances } from "../balances-api"
import { invalidateNetworth } from "../networth-api"
import { parseCsv } from "./csv-utils"

export async function addFileImport(
  file: File,
  progress: ProgressCallback = noop,
  accountName: string,
  getParserContext: ParserContextFn = async () => ({})
) {
  const account = getAccount(accountName)
  const { name, type, lastModified, size } = file

  if (type !== "text/csv") {
    throw new Error("Error reading file: not .csv")
  }

  // FIXME Looks like on mobile, lastModified is set to Date.now()
  // const _id = hashString(`fi_${name}_${size}_${lastModified}`)
  const _id = hashString(`fi_${name}_${size}`)

  await account.fileImportsDB.put({
    _id,
    lastModified,
    name,
    size,
  } as unknown as FileImport)

  // parse file
  const text = await file.text()
  try {
    const { metadata, logs, transactions } = await parseCsv(text, _id, progress, getParserContext)

    // save logs
    progress([60, `Saving ${logs.length} audit logs to disk`])
    await account.auditLogsDB.bulkDocs(logs)

    // save transactions
    progress([80, `Saving ${transactions.length} transactions to disk`])
    await account.transactionsDB.bulkDocs(transactions)

    // update cursor
    let oldestTimestamp: Timestamp | undefined

    for (const log of logs) {
      if (!oldestTimestamp || log.timestamp < oldestTimestamp) {
        oldestTimestamp = log.timestamp
      }
    }

    if (oldestTimestamp) {
      const newCursor = oldestTimestamp - (oldestTimestamp % 86400000) - 86400000
      progress([25, `Setting balances cursor to ${formatDate(newCursor)}`])
      await invalidateBalances(newCursor, accountName)
      await invalidateNetworth(newCursor, accountName)
    }

    // save metadata
    const fileImport = await account.fileImportsDB.get(_id)
    fileImport.timestamp = new Date().getTime()
    fileImport.meta = metadata
    await account.fileImportsDB.put<FileImport>(fileImport)

    return { _id, metadata }
  } catch (error) {
    const fileImport = await account.fileImportsDB.get(_id)
    await account.fileImportsDB.remove(fileImport)
    throw error
  }
}

export async function getFileImports(accountName: string) {
  const account = getAccount(accountName)
  const res = await account.fileImportsDB.allDocs<FileImport>({
    include_docs: true,
  })
  return res.rows.map((row) => row.doc) as FileImport[]
}

export async function removeFileImport(
  fileImport: FileImport,
  progress: ProgressCallback,
  accountName: string
) {
  const account = getAccount(accountName)
  // TODO consider pagination
  const logs = await account.auditLogsDB.allDocs({
    // Prefix search
    // https://pouchdb.com/api.html#batch_fetch
    endkey: `${fileImport._id}\ufff0`,
    include_docs: true,
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
  // Update cursor
  let oldestTimestamp: Timestamp | undefined

  for (const row of logs.rows) {
    if (!row.doc?.timestamp) continue

    if (!oldestTimestamp || row.doc.timestamp < oldestTimestamp) {
      oldestTimestamp = row.doc.timestamp
    }
  }

  if (oldestTimestamp) {
    const newCursor = oldestTimestamp - (oldestTimestamp % 86400000) - 86400000
    progress([25, `Setting balances cursor to ${formatDate(newCursor)}`])
    await invalidateBalances(newCursor, accountName)
    await invalidateNetworth(newCursor, accountName)
  }

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

  //
  progress([95, `Removing file import`])
  const _res = await account.fileImportsDB.remove(fileImport)
  return logs.rows.length
}

export function subscribeToFileImports(callback: () => void, accountName: string) {
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
