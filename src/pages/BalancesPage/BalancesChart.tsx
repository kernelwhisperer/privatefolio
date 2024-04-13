import { useMediaQuery } from "@mui/material"
import { useStore } from "@nanostores/react"
import { proxy } from "comlink"
import { debounce } from "lodash-es"
import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { DEFAULT_DEBOUNCE_DURATION } from "src/settings"
import { $quoteCurrency } from "src/stores/account-settings-store"
import { $activeAccount } from "src/stores/account-store"
import { $debugMode } from "src/stores/app-store"
import { aggregateByWeek, createPriceFormatter } from "src/utils/chart-utils"

import { QueryFunction, SingleSeriesChart, TooltipOpts } from "../../components/SingleSeriesChart"
import { clancy } from "../../workers/remotes"

function BalancesChartBase() {
  const activeAccount = useStore($activeAccount)
  // hack to  refresh the chart
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const unsubscribePromise = clancy.subscribeToNetworth(
      proxy(
        debounce(() => {
          setRefresh(Math.random())
        }, DEFAULT_DEBOUNCE_DURATION)
      ),
      activeAccount
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [activeAccount])

  const queryFn: QueryFunction = useCallback(
    async (interval) => {
      const networth = await clancy.getHistoricalNetworth(activeAccount)
      return interval === "1w" ? aggregateByWeek(networth) : networth
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeAccount, refresh]
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

  const debugMode = useStore($debugMode)

  const tooltipOptions: TooltipOpts = useMemo(
    () => ({
      currencySymbol: currency.symbol,
      significantDigits: isMobile ? currency.significantDigits : currency.maxDigits,
      tooltip: {
        compact: isMobile,
        dateSecondary: !debugMode,
        showTime: debugMode,
      },
    }),
    [currency, debugMode, isMobile]
  )

  return (
    <SingleSeriesChart
      size="medium"
      queryFn={queryFn}
      tooltipOptions={tooltipOptions}
      chartOptions={chartOptions}
    />
  )
}

export const BalancesChart = memo(BalancesChartBase)
