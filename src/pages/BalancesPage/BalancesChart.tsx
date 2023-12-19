import React, { useCallback } from "react"

import { SingleSeriesChart } from "../../components/SingleSeriesChart"
import { Time } from "../../interfaces"
import { clancy } from "../../workers/remotes"

export function BalancesChart() {
  const queryFn = useCallback(async () => {
    const docs = await clancy.getHistoricalBalances(undefined, 200)

    const balances = await Promise.all(
      docs.map(async ({ _id, _rev, timestamp, ...balanceMap }) => {
        const priceMap = await clancy.getAssetPriceMap(timestamp)

        const totalValue = Object.keys(priceMap).reduce((acc, symbol) => {
          const price = priceMap[symbol]
          const balance = balanceMap[symbol]

          if (!price || !balance) return acc

          return acc + Math.round(price.value * balance * 100) / 100
        }, 0)

        return {
          time: (timestamp / 1000) as Time,
          value: totalValue,
        }
      })
    )

    // console.log("📜 LOG > query > records:", balances)
    return balances
  }, [])

  return (
    <SingleSeriesChart
      height={460}
      queryFn={queryFn}
      seriesOptions={{
        priceFormat: {
          minMove: 1,
          type: "volume",
        },
      }}
      tooltipOptions={{
        currencySymbol: "$",
        significantDigits: 0,
        tooltip: {
          dateSecondary: true,
          showTime: false,
        },
      }}
      chartOptions={{
        rightPriceScale: {
          minimumWidth: 92,
        },
      }}
    />
  )
}
