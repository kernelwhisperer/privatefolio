import { persistentMap } from "@nanostores/persistent"
import { atom, computed } from "nanostores"
import { PlatformId } from "src/interfaces"

import { $activeAccount } from "./account-store"

export const DEFAULT_SIGNIFICANT_DIGITS = 2

export interface Currency {
  logo?: string
  maxDigits: number
  name: string
  significantDigits: number
  symbol: string
}

export const DEFAULT_CURRENCIES: Currency[] = [
  {
    maxDigits: 2,
    name: "USD",
    significantDigits: 0,
    symbol: "$",
  },
  {
    maxDigits: 2,
    name: "EUR",
    significantDigits: 0,
    symbol: "€",
  },
  {
    maxDigits: 8,
    name: "BTC",
    significantDigits: 5,
    symbol: "₿", // ฿
  },
  {
    maxDigits: 6,
    name: "ETH",
    significantDigits: 3,
    symbol: "Ξ",
  },
]

export const $baseCurrency = atom<Currency>(DEFAULT_CURRENCIES[0])

export const defaultApiPreference: PlatformId = "coinbase"
export const $priceApiPreferences = persistentMap<Record<string, PlatformId | undefined>>(
  "privatefolio-price-api-pref",
  {}
)

export const $priceApiPref = computed(
  [$activeAccount, $priceApiPreferences],
  (activeAccount, priceApiPreferences) => {
    return priceApiPreferences[activeAccount]
  }
)

export const $priceApi = computed($priceApiPref, (priceApiPref) => {
  return priceApiPref || defaultApiPreference
})

export const $hideSmallBalancesMap = persistentMap<Record<string, string | undefined>>(
  "privatefolio-small-balances",
  {}
)

export const $hideSmallBalances = computed(
  [$activeAccount, $hideSmallBalancesMap],
  (activeAccount, hideSmallBalancesMap) => {
    const val = hideSmallBalancesMap[activeAccount]
    return typeof val === "string" ? val === "true" : true
  }
)
