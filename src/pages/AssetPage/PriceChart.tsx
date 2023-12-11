import React, { useCallback } from "react"

import { getPricesForAsset } from "../../api/daily-prices-api"
import { SingleSeriesChart } from "../../components/SingleSeriesChart"

type BalanceChartProps = {
  symbol: string
}

export function PriceChart(props: BalanceChartProps) {
  const { symbol } = props

  const queryFn = useCallback(async () => {
    const prices = await getPricesForAsset(symbol)
    return prices
  }, [symbol])

  return <SingleSeriesChart queryFn={queryFn} />
}
