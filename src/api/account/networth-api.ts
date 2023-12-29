import { formatDate } from "src/utils/formatting-utils"
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

  const balances = await getHistoricalBalances({ accountName })
  const count = balances.length
  progress([0, `Computing historical networth for ${count} total balances`])

  const docIds: Array<{ id: string }> = []
  const documentMap: Record<string, Networth> = {}

  await Promise.all(
    balances.map(async ({ _id, _rev, timestamp, ...balanceMap }, index) => {
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
      if (index !== 0 && (index + 1) % 250 === 0) {
        progress([(index * 100) / balances.length, `Computed ${formatDate(timestamp)}`])
      }
    })
  )

  const { results: docsWithRevision } = await account.networthDB.bulkGet({ docs: docIds })

  // TODO this throws
  const docs: Networth[] = docsWithRevision.map((x) => ({
    ...documentMap[x.id],
    _rev: "ok" in x.docs[0] ? x.docs[0].ok._rev : undefined,
  }))

  await account.networthDB.bulkDocs(docs)
  progress([100, `Computed all networth records`])
}
