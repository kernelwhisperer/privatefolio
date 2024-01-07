import { atom, computed } from "nanostores"

export const $accounts = atom<string[]>(["main"])

const accountIndex = window.location.pathname.split("/")[2]
const user = $accounts.get()[accountIndex]

export const $activeAccount = atom<string>(user || "main")
export const $activeIndex = computed($activeAccount, (activeAccount) => {
  return $accounts.get().indexOf(activeAccount)
})
