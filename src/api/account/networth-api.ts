import { formatDate } from "src/utils/formatting-utils"
import { noop } from "src/utils/utils"

import { Networth, Time } from "../../interfaces"
import { ProgressCallback } from "../../stores/task-store"
import { getAssetPriceMap } from "../core/daily-prices-api"
import { getAccount } from "../database"
import { validateOperation } from "../database-utils"
import { getHistoricalBalances } from "./balances-api"

export async function getHistoricalNetworth(accountName = "main") {
  const account = getAccount(accountName)
  const balances = await account.networthDB.allDocs({
    include_docs: true,
  })

  return balances.rows.map((x) => x.doc) as Networth[]
}

const pageSize = 250

export async function computeNetworth(progress: ProgressCallback = noop, accountName = "main") {
  const account = getAccount(accountName)

  const balances = await getHistoricalBalances({ accountName })
  const count = balances.length
  progress([5, `Computing networth for all ${count} days`])

  const docIds: Array<{ id: string }> = []
  const documentMap: Record<string, Networth> = {}

  for (let i = 0; i < count; i += pageSize) {
    await Promise.all(
      balances
        .slice(i, i + pageSize)
        .map(async ({ _id, _rev, timestamp, ...balanceMap }, index) => {
          const priceMap = await getAssetPriceMap(timestamp)

          const totalValue = Object.keys(priceMap).reduce((acc, symbol) => {
            const price = priceMap[symbol]
            const balance = balanceMap[symbol]

            if (!price || !balance) return acc

            return acc + Math.round(price.value * balance * 100) / 100
          }, 0)

          docIds.push({ id: _id })

          documentMap[_id] = {
            _id,
            change: 0,
            changePercentage: 0,
            time: (timestamp / 1000) as Time,
            value: totalValue,
          }
          if (index === 0) {
            progress([
              10 + (i * 90) / count,
              `Computing networth starting ${formatDate(timestamp)}`,
            ])
          }
        })
    )
  }

  const { results: docsWithRevision } = await account.networthDB.bulkGet({ docs: docIds })

  const docs: Networth[] = docsWithRevision.map((x) => ({
    ...documentMap[x.id],
    _rev: "ok" in x.docs[0] ? x.docs[0].ok._rev : undefined,
  }))

  const updates = await account.networthDB.bulkDocs(docs)
  validateOperation(updates)
  progress([100, `Computing networth for today`])
}
