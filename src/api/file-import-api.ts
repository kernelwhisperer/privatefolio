import { FileImport } from "../interfaces"
import { parseCsv } from "../utils/csv-utils"
import { hashString } from "../utils/utils"
import { auditLogsDB, fileImportsDB } from "./database"

export interface NewFileImport extends Omit<FileImport, "_attachments"> {
  _attachments: {
    0: {
      content_type: string
      data: File
    }
  }
}

export async function processFileImport(_id: string) {
  // parse file
  const fileImport = await fileImportsDB.get<FileImport>(_id, { attachments: true })
  const { metadata, logs } = await parseCsv(atob(fileImport._attachments[0].data), fileImport._id)

  // save logs
  await auditLogsDB.bulkDocs(logs)

  // save metadata
  await fileImportsDB.put<FileImport>({
    ...fileImport,
    meta: metadata,
  })
}

export async function addFileImport(file: File) {
  const { name, type, lastModified, size } = file

  if (type !== "text/csv") {
    throw new Error("Error reading file: not .csv")
  }

  const timestamp = new Date().getTime()
  const _id = hashString(`${name}_${size}_${lastModified}`)

  await fileImportsDB.put<Omit<FileImport, "_id" | "_rev" | "_attachments">>({
    _attachments: {
      0: {
        content_type: type,
        data: file,
      },
    },
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
    // attachments: true,
    // descending: true,
    include_docs: true,
  })
  return res.rows.map((row) => row.doc) as FileImport[]
}

export async function removeFileImport(fileImport: FileImport) {
  const logs = await auditLogsDB.allDocs({
    // Prefix search
    // https://pouchdb.com/api.html#batch_fetch
    endkey: `${fileImport._id}\ufff0`,
    startkey: fileImport._id,
  } as PouchDB.Core.AllDocsWithinRangeOptions)

  await auditLogsDB.bulkDocs(
    logs.rows.map((row) => ({ _deleted: true, _id: row.id, _rev: row.value.rev }))
  )

  const res = await fileImportsDB.remove(fileImport)
  return res.ok
}

export function subscribeToFileImports(callback: () => void) {
  const changes = fileImportsDB
    .changes({
      live: true,
      since: "now",
    })
    .on("change", callback)

  return () => {
    try {
      changes.cancel()
    } catch {}
  }
}
