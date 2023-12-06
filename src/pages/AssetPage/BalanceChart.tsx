import { Paper } from "@mui/material"
import { UTCTimestamp } from "lightweight-charts"
import React, { useCallback, useEffect, useState } from "react"

import { getHistoricalBalances } from "../../api/balances-api"
import { BaselineChart, BaselineDataType } from "../../components/BaselineChart"

type BalanceChartProps = {
  symbol: string
}

const CHART_HEIGHT = (1184 / 16) * 9

export function BalanceChart(props: BalanceChartProps) {
  const { symbol } = props

  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<BaselineDataType>([])

  const query = useCallback(async (symbol: string) => {
    setLoading(true)
    const docs = await getHistoricalBalances(symbol)

    const previousDay = docs[0].timestamp - 86400000
    const records = docs.map((item) => ({
      time: (item.timestamp / 1000) as UTCTimestamp,
      value: item[symbol],
    }))
    records.unshift({
      time: (previousDay / 1000) as UTCTimestamp,
      value: 0,
    })
    setData(records)
    setLoading(false)
  }, [])

  useEffect(() => {
    query(symbol)
  }, [query, symbol])

  return (
    <Paper
      sx={{
        height: 500,
        marginX: -2,
        maxHeight: 500,
        minHeight: 500,
        overflow: "hidden", // because of borderRadius
      }}
    >
      <BaselineChart data={data} unitLabel={"symbol"} significantDigits={0} />
    </Paper>
  )
}
