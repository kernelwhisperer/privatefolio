import React, { useCallback } from "react"

import { getHistoricalBalances } from "../../api/balances-api"
import { getAssetPriceMap } from "../../api/daily-prices-api"
import { SingleSeriesChart } from "../../components/SingleSeriesChart"
import { Time } from "../../interfaces"

export function BalancesChart() {
  const queryFn = useCallback(async () => {
    const docs = await getHistoricalBalances()

    const balances = await Promise.all(
      docs.map(async ({ _id, _rev, timestamp, ...balanceMap }) => {
        const priceMap = await getAssetPriceMap(timestamp)

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

    console.log("📜 LOG > query > records:", balances)
    return balances
  }, [])

  return <SingleSeriesChart height={300} queryFn={queryFn} />
}
