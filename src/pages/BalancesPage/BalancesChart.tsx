import { useMediaQuery } from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { useCallback, useMemo } from "react"
import { $baseCurrency } from "src/stores/currency-store"
import { createPriceFormatter } from "src/utils/chart-utils"

import { SingleSeriesChart, TooltipOpts } from "../../components/SingleSeriesChart"
import { clancy } from "../../workers/remotes"

export function BalancesChart() {
  const queryFn = useCallback(async () => {
    const balances = await clancy.getHistoricalNetworth()
    // console.log("📜 LOG > query > records:", balances)
    return balances
  }, [])

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
