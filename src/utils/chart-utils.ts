import { colors, Theme } from "@mui/material"
import { CandlestickSeriesPartialOptions } from "lightweight-charts"
import { ChartData } from "src/interfaces"
import { Currency } from "src/stores/account-settings-store"

import { TooltipPrimitiveOptions } from "../lightweight-charts/plugins/tooltip/tooltip"
import { formatNumber } from "./formatting-utils"
import { memoize } from "./fp-utils"

export const createPriceFormatter = memoize((currency: Currency) => {
  // TODO allowCompactPriceScale
  return (x: number) =>
    `${currency.symbol}${formatNumber(x, {
      maximumFractionDigits: currency.significantDigits,
      minimumFractionDigits: currency.significantDigits,
    })}`.replace(`${currency.symbol}-`, `-${currency.symbol}`)
})

// TODO
export const profitColor = "rgb(0, 150, 108)"
// export const lossColor = "rgb(220, 60, 70)"
// export const profitColor = "rgb(51,215,120)"
// export const lossColor = "rgb(239, 83, 80)"
export const neutralColor = "gray"
// export const profitColor = colors.green[500]
export const lossColor = colors.red[500]

export const candleStickOptions: CandlestickSeriesPartialOptions = {
  // ----default
  // rgb(227, 96, 85)
  // rgb(72, 163, 154)
  // ----tv-mobile
  // rgb(229, 75, 74)
  // rgb(58, 151, 129)
  // ----tv-web
  // rgb(242, 54, 69)
  // rgb(8, 153, 129)
  //
  borderDownColor: lossColor, // #dc3c46
  borderUpColor: profitColor, // #00966c
  downColor: lossColor,
  upColor: profitColor,
  wickDownColor: lossColor,
  wickUpColor: profitColor,
}

export type CommonTooltipOptions = {
  backgroundColor: string
  borderColor: string
  color: string
  /**
   * @default false
   */
  compact: boolean
  /**
   * @default false
   */
  dateSecondary: boolean
  secondaryColor: string
  /**
   * @default true
   */
  showTime: boolean
}

export function extractTooltipColors(theme: Theme): Partial<TooltipPrimitiveOptions>["tooltip"] {
  if (theme.palette.mode === "dark") {
    return {
      backgroundColor: theme.palette.grey[200],
      borderColor: theme.palette.background.default,
      color: theme.palette.common.black,
      secondaryColor: theme.palette.grey[600],
    }
  }

  return {
    backgroundColor: theme.palette.grey[900],
    borderColor: theme.palette.background.default,
    color: theme.palette.common.white,
    secondaryColor: theme.palette.grey[400],
  }
}

export function aggregateByWeek(data: ChartData[]) {
  const aggregatedData: ChartData[] = []

  let previousWeek: ChartData | undefined

  for (let i = 0; i < data.length; i += 7) {
    const weekData = data.slice(i, i + 7)
    const open = previousWeek ? previousWeek.close : weekData[0]?.value
    const close = weekData[weekData.length - 1]?.value
    const low = Math.min(...weekData.map((d) => d.value))
    const high = Math.max(...weekData.map((d) => d.value))

    const weekCandle = { close, high, low, open, time: weekData[0]?.time, value: close }
    previousWeek = weekCandle
    aggregatedData.push(weekCandle)
  }

  return aggregatedData
}
