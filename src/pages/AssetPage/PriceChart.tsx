import React, { useCallback } from "react"
import { $activeAccount } from "src/stores/account-store"
import { aggregateByWeek } from "src/utils/chart-utils"

import { QueryFunction, SingleSeriesChart } from "../../components/SingleSeriesChart"
import { clancy } from "../../workers/remotes"

type BalanceChartProps = {
  symbol: string
}

export function PriceChart(props: BalanceChartProps) {
  const { symbol } = props

  const queryFn: QueryFunction = useCallback(
    async (interval) => {
      const prices = await clancy.getPricesForAsset($activeAccount.get(), symbol)
      return interval === "1w" ? aggregateByWeek(prices) : prices
    },
    [symbol]
  )

  return (
    <SingleSeriesChart
      queryFn={queryFn}
      tooltipOptions={{
        currencySymbol: "$",
      }}
    />
  )
}
