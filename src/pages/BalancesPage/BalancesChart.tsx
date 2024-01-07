import { useMediaQuery } from "@mui/material"
import { useStore } from "@nanostores/react"
import { proxy } from "comlink"
import { debounce } from "lodash-es"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { DEFAULT_DEBOUNCE_DURATION } from "src/settings"
import { $activeAccount } from "src/stores/account-store"
import { $baseCurrency } from "src/stores/currency-store"
import { createPriceFormatter } from "src/utils/chart-utils"

import { SingleSeriesChart, TooltipOpts } from "../../components/SingleSeriesChart"
import { clancy } from "../../workers/remotes"

export function BalancesChart() {
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

  const queryFn = useCallback(async () => {
    const balances = await clancy.getHistoricalNetworth($activeAccount.get())
    // console.log("📜 LOG > query > records:", balances)
    return balances
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  const currency = useStore($baseCurrency)
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
    />
  )
}
