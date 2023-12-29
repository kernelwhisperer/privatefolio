import { Paper } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"

import { StackedChart, StackedDataType } from "../../components/StackedChart"
import { Time } from "../../interfaces"
import { clancy } from "../../workers/remotes"

export function BalancesChart() {
  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<StackedDataType>([])

  const query = useCallback(async () => {
    setLoading(true)
    const docs = await clancy.getHistoricalBalances({ limit: 200 })
    console.log("📜 LOG > query > docs:", docs)

    const balances = await Promise.all(
      docs.map(async ({ _id, _rev, timestamp, ...symbols }) => {
        const prices = await clancy.getAssetPriceMap(timestamp)
        console.log("📜 LOG > docs.map > prices:", prices)

        const assetValues = Object.entries(symbols)
          .map(([symbol, balance]) => {
            const price = prices[symbol]
            return {
              assetValue: price ? Math.round(price.value * balance * 100) / 100 : 0,
              symbol,
            }
          })
          .filter((x) => x.assetValue >= 0)

        assetValues.sort((a, b) => (b.assetValue || 0) - (a.assetValue || 0))

        console.log("📜 LOG > assetValues > assetValues:", assetValues)

        return {
          // ...x,
          // price,
          // value: price ? price.value * x.balance : undefined,
          time: (timestamp / 1000) as Time,
          values: assetValues.map((x) => x.assetValue).slice(0, 5),
        }
      })
    )

    // const records: StackedDataType = multipleBarData(5, 200, 2)
    setData(balances)
    console.log("📜 LOG > query > records:", balances)
    setLoading(false)
  }, [])

  useEffect(() => {
    query()
  }, [query])

  return (
    <Paper
      sx={{
        height: 300,
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
