import { proxy } from "comlink"

import { getAccount } from "../database"

export async function setValue(key: string, value: unknown, accountName = "main") {
  const account = getAccount(accountName)
  try {
    const existing = await account.keyValueDB.get(key)
    existing.value = value
    await account.keyValueDB.put(existing)
  } catch {
    await account.keyValueDB.put({ _id: key, value })
  }
}

export async function getValue<T>(
  key: string,
  defaultValue: T | null = null,
  accountName = "main"
): Promise<T | null> {
  const account = getAccount(accountName)
  try {
    const existing = await account.keyValueDB.get(key)
    return existing.value as T
  } catch {
    return defaultValue
  }
}

export function subscribeToKV(key: string, callback: () => void, accountName = "main") {
  const account = getAccount(accountName)
  const changesSub = account.keyValueDB
    .changes({
      live: true,
      selector: {
        _id: key,
      },
      since: "now",
    })
    .on("change", callback)

  return proxy(() => {
    try {
      changesSub.cancel()
    } catch {}
  })
}
