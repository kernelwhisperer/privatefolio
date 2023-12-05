import { Paper } from "@mui/material"
import { IChartApi } from "lightweight-charts"
import React, { useEffect, useRef } from "react"

import { getHistoricalBalances } from "../../api/balances-api"
import { Chart } from "../../components/Chart"

type BalanceChartProps = {
  symbol: string
}

export function BalanceChart(props: BalanceChartProps) {
  const { symbol } = props

  const chartRef = useRef<IChartApi | undefined>(undefined)

  useEffect(() => {
    setTimeout(async () => {
      const res = await getHistoricalBalances(symbol)
      const previousDay = res[0].timestamp - 86400000
      const data = res.map((item) => ({
        // color: item.amount > 0 ? "green" : "red",
        time: item.timestamp / 1000,
        value: item[symbol],
      }))
      data.unshift({
        time: previousDay / 1000,
        value: 0,
      })
      console.log("📜 LOG > setTimeout > res:", res)

      const series = chartRef.current?.addAreaSeries({
        lineType: 0,
      })
      series?.setData(data)
      chartRef.current?.timeScale().fitContent()
    }, 500)
  }, [])

  return (
    <Paper
      sx={{
        height: 500,
        marginX: -2,

        // paddingY: 0.5
        overflow: "hidden",
      }}
    >
      <Chart chartRef={chartRef} unitLabel={"symbol"} significantDigits={0} />
    </Paper>
  )
}
