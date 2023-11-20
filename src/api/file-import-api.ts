import { fileImportsDB } from "./database"

export interface FileImport {
  _attachments: {
    0: {
      content_type: string
      data: File
    }
  }
  _id: string
  _rev: string
  lastModified: number
  name: string
  size: number
  timestamp: number
}

export async function addFileImport(file: File) {
  const { name, type, lastModified, size } = file

  if (type !== "text/csv") {
    throw new Error("Error reading file: not .csv")
  }

  const res = await fileImportsDB.post<Omit<FileImport, "_id" | "_rev">>({
    _attachments: {
      0: {
        content_type: type,
        data: file,
      },
    },
    lastModified,
    name,
    size,
    timestamp: new Date().getTime(),
  })

  return res.id
}

export async function getFileImports() {
  const res = await fileImportsDB.allDocs<FileImport>({ descending: true, include_docs: true })
  return res.rows.map((row) => row.doc) as FileImport[]
}

export async function removeFileImport(fileImport: FileImport) {
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
