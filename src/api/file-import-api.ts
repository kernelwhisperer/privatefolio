import { parseCsv } from "../utils/csv-utils"
import { auditLogsDB, fileImportsDB } from "./database"

export interface FileImport {
  _attachments: {
    0: {
      content_type: string
      /**
       * base64 encoded
       */
      data: string
    }
  }
  _id: string
  _rev: string
  integration?: string
  lastModified: number
  logs?: number
  name: string
  rows?: number
  size: number
  timestamp: number
}

export interface NewFileImport extends Omit<FileImport, "_attachments"> {
  _attachments: {
    0: {
      content_type: string
      data: File
    }
  }
}

export async function addFileImport(file: File) {
  const { name, type, lastModified, size } = file
  const timestamp = new Date().getTime()

  if (type !== "text/csv") {
    throw new Error("Error reading file: not .csv")
  }

  // metadata
  const { id, rev } = await fileImportsDB.post<Omit<FileImport, "_id" | "_rev" | "_attachments">>({
    lastModified,
    name,
    size,
    timestamp,
  })

  setTimeout(async () => {
    // save file
    await fileImportsDB.put<NewFileImport>({
      _attachments: {
        0: {
          content_type: type,
          data: file,
        },
      },
      _id: id,
      _rev: rev,
      lastModified,
      name,
      size,
      timestamp,
    })

    // parse file
    const fileImport = await fileImportsDB.get<FileImport>(id, { attachments: true })
    const { metadata, logs } = await parseCsv(atob(fileImport._attachments[0].data), fileImport._id)
    console.log("📜 LOG > setTimeout > metadata, logs:", metadata, logs)

    // save logs
    const res = await auditLogsDB.bulkDocs(logs)
    console.log("📜 LOG > setTimeout > res:", res)

    // save metadata
    await fileImportsDB.put<FileImport>({
      ...fileImport,
      ...metadata,
    })
  }, 50)

  return id
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
  console.log("📜 LOG > removeFileImport > fileImport._id:", fileImport._id)
  const logs = await auditLogsDB.allDocs({
    // Prefix search
    // https://pouchdb.com/api.html#batch_fetch
    endkey: `${fileImport._id}\ufff0`,
    startkey: fileImport._id,
  } as PouchDB.Core.AllDocsWithinRangeOptions)
  console.log("📜 LOG > removeFileImport > res:", logs)

  await Promise.all(logs.rows.map((row) => auditLogsDB.remove(row.id, row.value.rev)))

  const res = await fileImportsDB.remove(fileImport)
  return res.ok
}

export function subscribeToFileImports(callback: (fileImports: FileImport[]) => void) {
  const changes = fileImportsDB
    .changes({
      live: true,
      since: "now",
    })
    .on("change", () => {
      getFileImports().then(callback)
    })

  return () => {
    try {
      changes.cancel()
    } catch {}
  }
}
