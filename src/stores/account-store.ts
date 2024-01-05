import { atom } from "nanostores"

export const $accounts = atom<string[]>(["main", "cold storage", "hot wallet"])

const userIndex = window.location.pathname.split("/")[2]
const user = $accounts.get()[userIndex]

export const $activeAccount = atom<string>(user || "main")
