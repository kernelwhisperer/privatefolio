import { keyValueDB } from "./database"

export async function setValue(key: string, value: any) {
  try {
    const existing = await keyValueDB.get(key)
    existing.value = value
    await keyValueDB.put(existing)
  } catch {
    await keyValueDB.put({ _id: key, value })
  }
}

export async function getValue(key: string) {
  try {
    const existing = await keyValueDB.get(key)
    return existing.value
  } catch {
    return undefined
  }
}
