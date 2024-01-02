import { atom } from "nanostores"

export const $accounts = atom<string[]>(["main", "second", "all"])
export const $activeAccount = atom<string>("main")
