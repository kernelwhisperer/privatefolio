import { Paper } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"

import { getAssetPrices } from "../../api/daily-prices-api"
import { SingleSeriesChart } from "../../components/SingleSeriesChart"
import { ChartData } from "../../interfaces"
import { CHART_HEIGHT } from "../../utils/chart-utils"

type BalanceChartProps = {
  symbol: string
}

export function PriceChart(props: BalanceChartProps) {
  const { symbol } = props

  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<ChartData[]>([])

  const query = useCallback(async (symbol: string) => {
    setLoading(true)
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

    setData(prices)
    console.log("📜 LOG > query > records:", prices)
    setLoading(false)
  }, [])

  useEffect(() => {
    query(symbol)
  }, [query, symbol])

  return (
    <Paper
      sx={{
        height: CHART_HEIGHT,
        marginX: -2,
        overflow: "hidden", // because of borderRadius
        position: "relative",
      }}
    >
      <SingleSeriesChart
        data={data}
        chartOptions={
          {
            // localization: {
            //   priceFormatter: createPriceFormatter(0, "USD"),
            // },
          }
        }
      />
    </Paper>
  )
}
