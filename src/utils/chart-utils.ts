import { formatNumber } from "./client-utils"

export const CHART_HEIGHT = 700

export function createPriceFormatter(significantDigits: number, unitLabel: string) {
  return (x: number) =>
    `${formatNumber(x, {
      maximumFractionDigits: significantDigits,
      minimumFractionDigits: significantDigits,
    })} ${unitLabel}`
}
