import { Paper } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"

import { StackedChart, StackedDataType } from "../../components/StackedChart"
import { multipleBarData } from "../../lightweight-charts/sample-data"

export function BalancesChart() {
  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<StackedDataType>([])

  const query = useCallback(async () => {
    setLoading(true)
    // const docs = await getHistoricalBalances()
    // console.log("📜 LOG > query > docs:", docs)

    // const records: StackedDataType = docs.map(({ _id, _rev, timestamp, ...x }) => ({
    //   // customValues: [docs.ETH, docs.CRV, docs.SNX],
    //   time: (timestamp / 1000) as UTCTimestamp,
    //   values: Object.values(x),
    // }))
    const records: StackedDataType = multipleBarData(5, 200, 2)
    setData(records)
    // console.log("📜 LOG > query > records:", records)
    setLoading(false)
  }, [])

  useEffect(() => {
    query()
  }, [query])

  return (
    <Paper
      sx={{
        height: 300,
        marginX: -2,
        overflow: "hidden", // because of borderRadius
      }}
    >
      <StackedChart
        data={data}
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
