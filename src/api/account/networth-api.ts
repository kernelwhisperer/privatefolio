import { noop } from "src/utils/utils"

import { Networth, Time } from "../../interfaces"
import { ProgressCallback } from "../../stores/task-store"
import { getAssetPriceMap } from "../core/daily-prices-api"
import { getAccount } from "../database"
import { getHistoricalBalances } from "./balances-api"

export async function getHistoricalNetworth(accountName = "main") {
  const account = getAccount(accountName)
  const balances = await account.networthDB.allDocs({
    include_docs: true,
  })

  return balances.rows.map((x) => x.doc) as Networth[]
}

export async function computeNetworth(progress: ProgressCallback = noop, accountName = "main") {
  const account = getAccount(accountName)

  const balances = await getHistoricalBalances({
    accountName,
  })
  const count = balances.length
  progress([0, `Computing historical networth for ${count} total balances`])

  const networthArray: Networth[] = await Promise.all(
    balances.map(async ({ _id, _rev, timestamp, ...balanceMap }) => {
      const priceMap = await getAssetPriceMap(timestamp)

      const totalValue = Object.keys(priceMap).reduce((acc, symbol) => {
        const price = priceMap[symbol]
        const balance = balanceMap[symbol]

        if (!price || !balance) return acc

        return acc + Math.round(price.value * balance * 100) / 100
      }, 0)

      return {
        _id,
        change: 0,
        changePercentage: 0,
        time: (timestamp / 1000) as Time,
        value: totalValue,
      }
    })
  )

  await account.networthDB.bulkDocs(networthArray)
  progress([100, `Computed all networth records!`])
}
