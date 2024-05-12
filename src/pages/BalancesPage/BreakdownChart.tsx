import { Stack, useMediaQuery } from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { useCallback, useMemo } from "react"
import { QueryFunction, SingleSeriesChart, TooltipOpts } from "src/components/SingleSeriesChart"
import { WorkInProgressCallout } from "src/components/WorkInProgressCallout"
import { $quoteCurrency } from "src/stores/account-settings-store"
import { $activeAccount } from "src/stores/account-store"
import { $debugMode } from "src/stores/app-store"
import { getAssetTicker } from "src/utils/assets-utils"
import { createPriceFormatter } from "src/utils/chart-utils"

import { Time } from "../../interfaces"
import { clancy } from "../../workers/remotes"

export function BreakdownChart() {
  const queryFn: QueryFunction = useCallback(async (interval) => {
    const balances = (
      await clancy.getHistoricalBalances($activeAccount.get(), {
        limit: 200,
        order: "desc",
      })
    ).reverse()
    // console.log("📜 LOG > query > balances:", balances)

    const records = await Promise.all(
      balances.map(async ({ _id, _rev, timestamp: _timestamp, ...symbols }) => {
        const prices = await clancy.getAssetPriceMap($activeAccount.get(), Number(_id))
        // console.log("📜 LOG > docs.map > prices:", prices)

        const assetValues = Object.entries(symbols)
          .map(([symbol, balance]) => {
            const price = prices[symbol]
            return {
              symbol,
              value: price ? Math.round(price.value * Number(balance) * 100) / 100 : 0,
            }
          })
          .filter((x) => x.value >= 0)

        assetValues.sort((a, b) => (b.value || 0) - (a.value || 0))

        // console.log("📜 LOG > assetValues > assetValues:", assetValues)

        return {
          assets: assetValues.map((x) => getAssetTicker(x.symbol)),
          // .slice(0, 5)
          time: (Number(_id) / 1000) as Time,
          values: assetValues.map((x) => x.value),
          // .slice(0, 5)
        }
      })
    )
    console.log("📜 LOG > query > records:", records)

    // const dummyData: StackedDataType = multipleBarData(5, 200, 2)
    // setData(dummyData)
    // console.log("📜 LOG > query > dummyData:", dummyData)
    return records
  }, [])

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
      // currencySymbol: currency.symbol,
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
    <Stack gap={1}>
      <SingleSeriesChart
        size="medium"
        queryFn={queryFn}
        tooltipOptions={tooltipOptions}
        chartOptions={chartOptions}
      />
      <WorkInProgressCallout />
    </Stack>
  )
}
