import React, { useCallback } from "react"

import { getAssetPrices } from "../../api/daily-prices-api"
import { SingleSeriesChart } from "../../components/SingleSeriesChart"

type BalanceChartProps = {
  symbol: string
}

export function PriceChart(props: BalanceChartProps) {
  const { symbol } = props

  const queryFn = useCallback(async () => {
    // const docs = await getHistoricalBalances(symbol)
    // const klines = await queryPrices({
    //   // limit: 1,
    //   pair: `${symbol}USDT`,
    //   timeInterval: "1d" as ResolutionString,
    // })
    // const prices = klines.map(mapToCandle)
    const prices = await getAssetPrices(symbol)
    console.log("📜 LOG > query > prices:", prices)

    // const records = docs.map((item) => ({
    //   time: (item.timestamp / 1000) as UTCTimestamp,
    //   value: item[symbol],
    // }))
    // const previousDay = docs[0].timestamp - 86400000
    // records.unshift({
    //   time: (previousDay / 1000) as UTCTimestamp,
    //   value: 0,
    // })

    return prices
  }, [symbol])

  return <SingleSeriesChart queryFn={queryFn} />
}
