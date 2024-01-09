import { atom, computed } from "nanostores"
import { logAtoms } from "src/utils/browser-utils"

const savedAccounts = localStorage.getItem("accounts")
const accounts: string[] = savedAccounts ? JSON.parse(savedAccounts) : ["main"]

export const $accounts = atom<string[]>(accounts)

$accounts.listen((accounts) => {
  localStorage.setItem("accounts", JSON.stringify(accounts))
})

const accountIndex = window.location.pathname.split("/")[2]
const user = $accounts.get()[accountIndex]

export const $activeAccount = atom<string>(user || "main")
export const $activeIndex = computed($activeAccount, (activeAccount) => {
  return $accounts.get().indexOf(activeAccount)
})

logAtoms({ $accounts, $activeAccount, $activeIndex })
