import { proxy } from "comlink"
import { formatDate } from "src/utils/formatting-utils"
import { noop } from "src/utils/utils"

import { Networth, Time, Timestamp } from "../../interfaces"
import { ProgressCallback } from "../../stores/task-store"
import { getAccount } from "../database"
import { validateOperation } from "../database-utils"
import { getAssetPriceMap } from "./daily-prices-api"
import { getValue, setValue } from "./kv-api"

export async function invalidateNetworth(newValue: Timestamp, accountName: string) {
  const existing = (await getValue<Timestamp>("networthCursor", 0, accountName)) as Timestamp

  if (newValue < existing) {
    await setValue("networthCursor", newValue, accountName)
  }
}

export async function getHistoricalNetworth(accountName: string) {
  const account = getAccount(accountName)
  const balances = await account.networthDB.allDocs({
    include_docs: true,
  })

  const cursor = (await getValue<Timestamp>("networthCursor", 0, accountName)) as Timestamp
  const cursorAsTime = cursor / 1000

  const list: Networth[] = []
  for (const row of balances.rows) {
    if (row.doc?.time && row.doc.time <= cursorAsTime) {
      list.push(row.doc as Networth)
    }
  }

  return list
}

const pageSize = 250

export async function computeNetworth(
  accountName: string,
  since?: Timestamp,
  progress: ProgressCallback = noop,
  signal?: AbortSignal
) {
  const account = getAccount(accountName)

  if (since === undefined) {
    since = (await getValue<Timestamp>("networthCursor", 0, accountName)) as Timestamp
  }

  const { indexes } = await account.balancesDB.getIndexes()
  if (indexes.length === 1) {
    await account.balancesDB.createIndex({
      index: {
        fields: ["timestamp"],
        name: "timestamp",
      },
    })
  }
  if (signal?.aborted) {
    throw new Error(signal.reason)
  }

  const balances = await account.balancesDB
    .find({
      selector: {
        timestamp: { $gte: since },
      },
      sort: [{ timestamp: "asc" }],
    })
    .then((x) => x.docs)

  if (signal?.aborted) {
    throw new Error(signal.reason)
  }

  const count = balances.length
  progress([5, `Computing networth for ${count} days`])

  const docIds: Array<{ id: string }> = []
  const documentMap: Record<string, Networth> = {}

  let latestNetworth: Networth = {
    _id: "0",
    change: 0,
    changePercentage: 0,
    time: 0 as Time,
    value: 0,
  }

  for (let i = 0; i < count; i++) {
    const { _id, _rev, timestamp, ...balanceMap } = balances[i]

    const priceMap = await getAssetPriceMap(accountName, timestamp)

    const totalValue = Object.keys(priceMap).reduce((acc, symbol) => {
      const price = priceMap[symbol]
      const balance = balanceMap[symbol]

      if (!price || !balance) return acc

      return acc + Math.round(price.value * Number(balance) * 100) / 100
    }, 0)

    docIds.push({ id: _id })

    const networth: Networth = {
      _id,
      change: 0,
      changePercentage: 0,
      time: (timestamp / 1000) as Time,
      value: totalValue,
    }

    if (i !== 0) {
      networth.change = Math.round((networth.value - latestNetworth.value) * 100) / 100
      networth.changePercentage =
        networth.change === 0 || latestNetworth.value === 0
          ? 0
          : Math.round((networth.change / latestNetworth.value) * 100 * 100) / 100

      latestNetworth = networth
    } else {
      latestNetworth = networth
    }

    documentMap[_id] = networth

    if (i % pageSize === 0) {
      progress([10 + (i * 90) / count, `Computing networth starting ${formatDate(timestamp)}`])
    }
    if (signal?.aborted) {
      throw new Error(signal.reason)
    }
  }

  const { results: docsWithRevision } = await account.networthDB.bulkGet({ docs: docIds })

  const docs: Networth[] = docsWithRevision.map((x) => ({
    ...documentMap[x.id],
    _rev: "ok" in x.docs[0] ? x.docs[0].ok._rev : undefined,
  }))

  const updates = await account.networthDB.bulkDocs(docs)
  validateOperation(updates)

  if (balances.length > 0) {
    const cursor = balances[balances.length - 1].timestamp
    progress([99, `Setting networth cursor to ${formatDate(cursor)}`])
    await setValue("networthCursor", cursor, accountName)
  }
}

export function subscribeToNetworth(callback: () => void, accountName: string) {
  const account = getAccount(accountName)
  const changesSub = account.networthDB
    .changes({
      live: true,
      since: "now",
    })
    .on("change", callback)

  return proxy(() => {
    try {
      changesSub.cancel()
    } catch {}
  })
}
