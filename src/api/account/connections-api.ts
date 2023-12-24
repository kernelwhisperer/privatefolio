import { Connection } from "../../interfaces"
import { hashString } from "../../utils/utils"
import { getAccount } from "../database"

export async function addConnection(
  connection: Omit<Connection, "_id" | "createdAt" | "syncedAt">,
  accountName = "main"
) {
  const { address, integration, label } = connection
  const account = getAccount(accountName)

  const createdAt = new Date().getTime()
  const _id = hashString(`${integration}_${address}_${label}`)

  await account.connectionsDB.put({
    ...connection,
    _id,
    createdAt,
  })

  return _id
}
