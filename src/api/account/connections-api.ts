import { proxy } from "comlink"
import { ProgressCallback } from "src/stores/task-store"

import { Connection } from "../../interfaces"
import { hashString } from "../../utils/utils"
import { getAccount } from "../database"

export async function addConnection(
  connection: Omit<Connection, "_id" | "_rev" | "timestamp" | "syncedAt">,
  accountName = "main"
) {
  const { address, integration, label } = connection
  const account = getAccount(accountName)

  const timestamp = new Date().getTime()
  const _id = hashString(`${integration}_${address}_${label}`)

  await account.connectionsDB.put({
    ...connection,
    _id,
    _rev: undefined,
    timestamp,
  })

  return _id
}

export async function getConnections(accountName = "main") {
  const account = getAccount(accountName)
  const res = await account.connectionsDB.allDocs<Connection>({
    include_docs: true,
  })
  return res.rows.map((row) => row.doc) as Connection[]
}

export async function removeConnection(
  connection: Connection,
  progress: ProgressCallback,
  accountName = "main"
) {
  const account = getAccount(accountName)

  const res = await account.connectionsDB.remove(connection)
  return res.ok
}

export function subscribeToConnections(callback: () => void, accountName = "main") {
  const account = getAccount(accountName)
  const changesSub = account.connectionsDB
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
