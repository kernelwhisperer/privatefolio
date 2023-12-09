import { Paper } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"

import { queryPrices } from "../../api/binance-price-api"
import { HistogramDataType, SingleSeriesChart } from "../../components/SingleSeriesChart"
import { ResolutionString } from "../../interfaces"
import { createPriceFormatter } from "../../utils/chart-utils"

type BalanceChartProps = {
  symbol: string
}

const CHART_HEIGHT = (1184 / 16) * 9

export function PriceChart(props: BalanceChartProps) {
  const { symbol } = props

  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<HistogramDataType>([])

  const query = useCallback(async (symbol: string) => {
    setLoading(true)
    // const docs = await getHistoricalBalances(symbol)
    const prices = await queryPrices({
      // limit: 1,
      pair: `${symbol}USDT`,
      timeInterval: "1d" as ResolutionString,
    })
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
        height: 700,
        marginX: -2,
        overflow: "hidden", // because of borderRadius
        position: "relative",
      }}
    >
      <SingleSeriesChart
        data={data}
        chartOptions={{
          localization: {
            priceFormatter: createPriceFormatter(0, "USD"),
          },
        }}
      />
    </Paper>
  )
}
