import React, { useCallback } from "react"
import { createPriceFormatter } from "src/utils/chart-utils"

import { SingleSeriesChart } from "../../components/SingleSeriesChart"
import { clancy } from "../../workers/remotes"

export function BalancesChart() {
  const queryFn = useCallback(async () => {
    const balances = await clancy.getHistoricalNetworth()

    console.log("📜 LOG > query > records:", balances)
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
        currencySymbol: "USD",
        significantDigits: 0,
        tooltip: {
          dateSecondary: true,
          showTime: false,
        },
      }}
      chartOptions={{
        localization: {
          priceFormatter: createPriceFormatter(0, "USD "),
        },
      }}
    />
  )
}
