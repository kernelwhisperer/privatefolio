import { UTCTimestamp } from "lightweight-charts"
import React, { useCallback } from "react"
import { $activeAccount } from "src/stores/account-store"

import { QueryFunction, SingleSeriesChart } from "../../components/SingleSeriesChart"
import { clancy } from "../../workers/remotes"

type BalanceChartProps = {
  symbol: string
}

export function BalanceChart(props: BalanceChartProps) {
  const { symbol } = props

  const queryFn: QueryFunction = useCallback(async () => {
    const docs = await clancy.getHistoricalBalances($activeAccount.get(), { symbol })

    const records = docs.map((item) => ({
      time: (item.timestamp / 1000) as UTCTimestamp,
      value: item[symbol],
    }))

    // TODO
    // const previousDay = docs[0].timestamp - 86400000
    // records.unshift({
    //   time: (previousDay / 1000) as UTCTimestamp,
    //   value: 0,
    // })

    return records
  }, [symbol])

  return (
    <SingleSeriesChart
      queryFn={queryFn}
      initType="Histogram"
      tooltipOptions={{
        currencySymbol: symbol,
        significantDigits: 18, // TODO
      }}
    />
  )
}
