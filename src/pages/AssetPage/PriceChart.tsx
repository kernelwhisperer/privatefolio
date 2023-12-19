import React, { useCallback } from "react"

import { SingleSeriesChart } from "../../components/SingleSeriesChart"
import { clancy } from "../../workers/remotes"

type BalanceChartProps = {
  symbol: string
}

export function PriceChart(props: BalanceChartProps) {
  const { symbol } = props

  const queryFn = useCallback(async () => {
    const prices = await clancy.getPricesForAsset(symbol)
    return prices
  }, [symbol])

  return (
    <SingleSeriesChart
      queryFn={queryFn}
      tooltipOptions={{
        currencySymbol: "$",
      }}
    />
  )
}
