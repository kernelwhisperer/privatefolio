import { proxy } from "comlink"

import { keyValueDB } from "./database"

export async function setValue(key: string, value: unknown) {
  try {
    const existing = await keyValueDB.get(key)
    existing.value = value
    await keyValueDB.put(existing)
  } catch {
    await keyValueDB.put({ _id: key, value })
  }
}

export async function getValue<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
  try {
    const existing = await keyValueDB.get(key)
    return existing.value as T
  } catch {
    return defaultValue
  }
}

export function subscribeToKV(key: string, callback: () => void) {
  const changesSub = keyValueDB
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
