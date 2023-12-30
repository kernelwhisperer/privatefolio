import { Theme } from "@mui/material"
import { CandlestickSeriesPartialOptions } from "lightweight-charts"

import { TooltipPrimitiveOptions } from "../lightweight-charts/plugins/tooltip/tooltip"
import { formatNumber } from "./formatting-utils"

export function createPriceFormatter(significantDigits: number, unitLabel: string) {
  return (x: number) =>
    `${formatNumber(x, {
      maximumFractionDigits: significantDigits,
      minimumFractionDigits: significantDigits,
    })} ${unitLabel}`
}

export const greenColorDark = "rgb(0, 150, 108)"
// export const redColorDark = "rgb(220, 60, 70)"
export const greenColor = "rgb(51,215,120)"
export const redColor = "rgb(239, 83, 80)"

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
  borderDownColor: redColor, // #dc3c46
  borderUpColor: greenColorDark, // #00966c
  downColor: redColor,
  // title: "hey",
  upColor: greenColorDark,
  wickDownColor: redColor,
  wickUpColor: greenColorDark,
}

export type CommonTooltipOptions = {
  backgroundColor: string
  borderColor: string
  color: string
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
