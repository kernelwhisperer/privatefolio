import { Paper } from "@mui/material"
import { UTCTimestamp } from "lightweight-charts"
import React, { useCallback, useEffect, useState } from "react"

import { getHistoricalBalances } from "../../api/balances-api"
import { SingleSeriesChart } from "../../components/SingleSeriesChart"
import { ChartData } from "../../interfaces"
import { CHART_HEIGHT } from "../../utils/chart-utils"

type BalanceChartProps = {
  symbol: string
}

export function BalanceChart(props: BalanceChartProps) {
  const { symbol } = props

  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<ChartData[]>([])

  const query = useCallback(async (symbol: string) => {
    setLoading(true)
    const docs = await getHistoricalBalances(symbol)
    // const prices = await queryPrices({
    //   pair: "BTCUSDT",
    //   timeInterval: "1d" as ResolutionString,
    // })
    // console.log("📜 LOG > query > prices:", prices)

    const records = docs.map((item) => ({
      time: (item.timestamp / 1000) as UTCTimestamp,
      value: item[symbol],
    }))
    // const previousDay = docs[0].timestamp - 86400000
    // records.unshift({
    //   time: (previousDay / 1000) as UTCTimestamp,
    //   value: 0,
    // })
    setData(records)
    console.log("📜 LOG > query > records:", records)
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
        initType="Histogram"
        chartOptions={
          {
            // localization: {
            //   priceFormatter: createPriceFormatter(0, symbol),
            // },
          }
        }
      />
    </Paper>
  )
}
