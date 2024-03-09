import { atom, computed } from "nanostores"
import { logAtoms } from "src/utils/browser-utils"

const savedAccounts = localStorage.getItem("privatefolio-accounts")
const accounts: string[] = savedAccounts ? JSON.parse(savedAccounts) : ["main"]

export const $accounts = atom<string[]>(accounts)
export const $accountReset = atom<number>(0)

$accounts.listen((accounts) => {
  localStorage.setItem("privatefolio-accounts", JSON.stringify(accounts))
})

const initialAccountIndex = Number(window.location.pathname.split("/")[2])
const initialAccount = !isNaN(initialAccountIndex) ? accounts[initialAccountIndex] : "main"

export const $activeAccount = atom<string>(initialAccount)
export const $activeIndex = computed($activeAccount, (activeAccount) => {
  return $accounts.get().indexOf(activeAccount)
})

logAtoms({ $accounts, $activeAccount, $activeIndex })
