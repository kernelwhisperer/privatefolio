import { persistentMap } from "@nanostores/persistent"
import { atom, computed } from "nanostores"
import { PriceApiId } from "src/interfaces"

import { $activeAccount } from "./account-store"

export const DEFAULT_SIGNIFICANT_DIGITS = 2

export interface Currency {
  logo?: string
  name: string
  significantDigits: number
  symbol: string
}

export const DEFAULT_CURRENCIES: Currency[] = [
  {
    name: "USD",
    significantDigits: 0,
    symbol: "$",
  },
  {
    name: "EUR",
    significantDigits: 0,
    symbol: "€",
  },
  {
    name: "BTC",
    significantDigits: 5,
    symbol: "₿", // ฿
  },
  {
    name: "ETH",
    significantDigits: 3,
    symbol: "Ξ",
  },
]

export const $baseCurrency = atom<Currency>(DEFAULT_CURRENCIES[0])

export const $priceApiPreferences = persistentMap<Record<string, PriceApiId | undefined>>(
  "privatefolio-price-api-pref",
  {}
)
export const defaultApiPreference: PriceApiId = "coinbase"

export const $priceApiPref = computed(
  [$activeAccount, $priceApiPreferences],
  (activeAccount, priceApiPreferences) => {
    return priceApiPreferences[activeAccount]
  }
)

export const $priceApi = computed($priceApiPref, (priceApiPref) => {
  return priceApiPref || defaultApiPreference
})
