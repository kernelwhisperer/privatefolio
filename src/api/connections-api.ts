import { Connection } from "../interfaces"
import { hashString } from "../utils/utils"
import { connectionsDB } from "./database"

export async function addConnection(
  connection: Omit<Connection, "_id" | "createdAt" | "syncedAt">
) {
  const { address, integration, label } = connection

  const createdAt = new Date().getTime()
  const _id = hashString(`${integration}_${address}_${label}`)

  await connectionsDB.put({
    ...connection,
    _id,
    createdAt,
  })

  return _id
}
