import { atom } from "nanostores"

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
