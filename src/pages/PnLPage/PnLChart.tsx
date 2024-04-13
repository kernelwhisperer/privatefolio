import { useMediaQuery } from "@mui/material"
import { useStore } from "@nanostores/react"
import { proxy } from "comlink"
import { debounce } from "lodash-es"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ChartData } from "src/interfaces"
import { DEFAULT_DEBOUNCE_DURATION } from "src/settings"
import { $quoteCurrency } from "src/stores/account-settings-store"
import { $activeAccount } from "src/stores/account-store"
import { createPriceFormatter, lossColor, neutralColor, profitColor } from "src/utils/chart-utils"

import { QueryFunction, SingleSeriesChart, TooltipOpts } from "../../components/SingleSeriesChart"
import { clancy } from "../../workers/remotes"

export function PnLChart() {
  // hack to  refresh the chart
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const unsubscribePromise = clancy.subscribeToNetworth(
      proxy(
        debounce(() => {
          setRefresh(Math.random())
        }, DEFAULT_DEBOUNCE_DURATION)
      ),
      $activeAccount.get()
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [])

  const queryFn: QueryFunction = useCallback(
    async (interval) => {
      const balances = await clancy.getHistoricalNetworth($activeAccount.get())

      const data = balances.map((balance) => ({
        color: balance.change === 0 ? neutralColor : balance.change > 0 ? profitColor : lossColor,
        time: balance.time,
        value: balance.change,
      }))

      let result: ChartData[]

      if (interval === "1w") {
        const aggregatedData: ChartData[] = []

        for (let i = 0; i < data.length; i += 7) {
          const weekData = data.slice(i, i + 7)
          const value = weekData.reduce((acc, day) => acc + day.value, 0)

          const weekCandle = {
            color: value === 0 ? neutralColor : value > 0 ? profitColor : lossColor,
            time: weekData[0]?.time,
            value,
          }
          aggregatedData.push(weekCandle)
        }
        result = aggregatedData
      } else {
        result = data
      }

      return result
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refresh]
  )

  const currency = useStore($quoteCurrency)
  const isMobile = useMediaQuery("(max-width: 599px)")

  const chartOptions = useMemo(
    () => ({
      localization: {
        priceFormatter: createPriceFormatter(currency),
      },
    }),
    [currency]
  )

  const tooltipOptions: TooltipOpts = useMemo(
    () => ({
      currencySymbol: currency.symbol,
      significantDigits: currency.significantDigits,
      tooltip: {
        compact: isMobile,
        dateSecondary: true,
        showTime: false,
      },
    }),
    [currency, isMobile]
  )

  return (
    <SingleSeriesChart
      size="medium"
      queryFn={queryFn}
      tooltipOptions={tooltipOptions}
      chartOptions={chartOptions}
      initType="Histogram"
    />
  )
}
