import { CandlestickSeriesPartialOptions } from "lightweight-charts"

import { formatNumber } from "./formatting-utils"

export const CHART_HEIGHT = 550

export function createPriceFormatter(significantDigits: number, unitLabel: string) {
  return (x: number) =>
    `${formatNumber(x, {
      maximumFractionDigits: significantDigits,
      minimumFractionDigits: significantDigits,
    })} ${unitLabel}`
}

export const greenColor = "rgb(0, 150, 108)"
export const redColor = "rgb(220, 60, 70)"

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
  borderUpColor: greenColor, // #00966c
  downColor: redColor,
  // title: "hey",
  upColor: greenColor,
  wickDownColor: redColor,
  wickUpColor: greenColor,
}
