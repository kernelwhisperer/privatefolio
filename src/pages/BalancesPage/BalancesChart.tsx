import React, { useCallback } from "react"
import { createPriceFormatter } from "src/utils/chart-utils"

import { SingleSeriesChart } from "../../components/SingleSeriesChart"
import { clancy } from "../../workers/remotes"

export function BalancesChart() {
  const queryFn = useCallback(async () => {
    const balances = await clancy.getHistoricalNetworth()

    // const balances = await Promise.all(
    //   docs.map(async ({ _id, _rev, timestamp, ...balanceMap }) => {
    //     const priceMap = await clancy.getAssetPriceMap(timestamp)

    //     const totalValue = Object.keys(priceMap).reduce((acc, symbol) => {
    //       const price = priceMap[symbol]
    //       const balance = balanceMap[symbol]

    //       if (!price || !balance) return acc

    //       return acc + Math.round(price.value * balance * 100) / 100
    //     }, 0)

    //     return {
    //       time: (timestamp / 1000) as Time,
    //       value: totalValue,
    //     }
    //   })
    // )

    // console.log("📜 LOG > query > records:", balances)
    return balances
  }, [])

  return (
    <SingleSeriesChart
      height={460}
      queryFn={queryFn}
      // seriesOptions={{
      //   priceFormat: {
      //     minMove: 1,
      //     type: "volume",
      //   },
      // }}
      tooltipOptions={{
        currencySymbol: "$",
        significantDigits: 0,
        tooltip: {
          dateSecondary: true,
          showTime: false,
        },
      }}
      chartOptions={{
        localization: {
          priceFormatter: createPriceFormatter(0, "USD"),
        },
      }}
    />
  )
}
