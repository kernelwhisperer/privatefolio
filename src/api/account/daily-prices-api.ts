import { proxy } from "comlink"
import { AssetId, ChartData, ResolutionString, SavedPrice, Time, Timestamp } from "src/interfaces"
import { PRICE_API_PAGINATION, PRICE_APIS_META, PriceApiId } from "src/settings"
import { ProgressCallback } from "src/stores/task-store"
import { getAssetTicker } from "src/utils/assets-utils"
import { formatDate } from "src/utils/formatting-utils"
import { noop } from "src/utils/utils"

import { getAccount } from "../database"
import { validateOperation } from "../database-utils"
import { PAIR_MAPPER, PRICE_APIS, PRICE_MAPPER } from "../external/prices/providers"
import { updateAsset } from "./assets-api"

export async function indexDailyPrices(accountName: string, progress: ProgressCallback = noop) {
  const account = getAccount(accountName)

  progress([0, "Daily prices: updating index for 'timestamp'"])
  await account.dailyPricesDB.createIndex({
    index: {
      fields: ["timestamp"],
      name: "timestamp",
    },
  })
  progress([50, "Daily prices: updating index for 'assetId'"])
  await account.dailyPricesDB.createIndex({
    index: {
      fields: ["assetId", "timestamp"],
      name: "assetId",
    },
  })
}

export async function getPricesForAsset(
  accountName: string,
  assetId: string,
  timestamp?: Timestamp
) {
  if (assetId === "USDT" && !!timestamp) {
    return [{ time: timestamp / 1000, value: 1 }] as ChartData[]
  }

  const account = getAccount(accountName)
  await indexDailyPrices(accountName)

  const _req: PouchDB.Find.FindRequest<SavedPrice> = {
    selector: {
      assetId,
      timestamp: timestamp || { $exists: true },
    },
    sort: [
      {
        //
        assetId: "asc",
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        timestamp: "asc",
      },
    ],
  }

  // console.log("📜 LOG > findTransactions > _req:", _req)
  // const explain = await (account.dailyPricesDB as any).explain(_req)
  // console.log("📜 LOG > findTransactions > explain:", explain.index)

  const prices = await account.dailyPricesDB.find(_req)

  return prices.docs.map((x) => x.price)
}

export async function getAssetPriceMap(
  accountName: string,
  timestamp: Timestamp = new Date().getTime()
) {
  await indexDailyPrices(accountName)
  const account = getAccount(accountName)

  const day: Timestamp = timestamp - (timestamp % 86400000)

  const _req: PouchDB.Find.FindRequest<SavedPrice> = {
    fields: ["assetId", "price", "source"],
    selector: { timestamp: day },
  }

  // console.log("📜 LOG > findTransactions > _req:", _req)
  // const explain = await (account.dailyPricesDB as any).explain(_req)
  // console.log("📜 LOG > findTransactions > explain:", explain.index)

  const prices = await account.dailyPricesDB.find(_req)

  return prices.docs.reduce(
    (map, x) => {
      map[x.assetId] = x.price
      return map
    },
    {
      USDT: { time: (day / 1000) as Time, value: 1 },
    } as Record<string, ChartData>
  )
}

export async function getPriceCursor(
  accountName: string,
  assetId: string
): Promise<Timestamp | undefined> {
  const account = getAccount(accountName)
  const prices = await account.dailyPricesDB.find({
    limit: 1,
    selector: {
      assetId,
      timestamp: { $exists: true },
    },
    sort: [
      {
        assetId: "desc",
        timestamp: "desc",
      },
    ],
  })

  if (prices.docs.length === 0) {
    return undefined
  }

  return prices.docs[0].timestamp
}

type FetchDailyPricesRequest = {
  assetIds?: AssetId[]
  priceApiMap?: Partial<Record<AssetId, PriceApiId>>
}

export async function fetchDailyPrices(
  accountName: string,
  request: FetchDailyPricesRequest,
  progress: ProgressCallback = noop,
  signal?: AbortSignal
) {
  const { assetIds, priceApiMap = {} } = request

  if (!assetIds) {
    throw new Error("No assetIds provided") // TODO prevent this
  }

  progress([0, `Fetching asset prices for ${assetIds.length} assets`])
  await indexDailyPrices(accountName)
  const account = getAccount(accountName)

  const now = Date.now()
  const today: Timestamp = now - (now % 86400000)

  const promises: (() => Promise<void>)[] = []

  for (let i = 1; i <= assetIds.length; i++) {
    // eslint-disable-next-line no-loop-func
    promises.push(async () => {
      const assetId = assetIds[i - 1]

      if (signal?.aborted) throw new Error(signal.reason)

      const preferredPriceApiId = priceApiMap[assetId]
      const priceApiIds = preferredPriceApiId
        ? [preferredPriceApiId]
        : (Object.keys(PRICE_APIS) as PriceApiId[])

      let since: Timestamp | undefined = await getPriceCursor(accountName, assetId)
      let until: Timestamp | undefined = today

      if (!since) since = today - 86400000 * (PRICE_API_PAGINATION - 1)

      for (const priceApiId of priceApiIds) {
        try {
          while (true) {
            const priceApi = PRICE_APIS[priceApiId]
            const priceMapper = PRICE_MAPPER[priceApiId]
            const pairMapper = PAIR_MAPPER[priceApiId]

            if (!priceApi || !priceMapper || !pairMapper) {
              throw new Error(`Price API "${priceApiId}" is not supported`)
            }

            const pair = pairMapper(assetId)

            const results = await priceApi({
              limit: PRICE_API_PAGINATION,
              pair,
              since,
              timeInterval: "1d" as ResolutionString,
              until,
            })

            if (!preferredPriceApiId && results.length > 0) {
              updateAsset(accountName, assetId, { priceApiId })
            }

            if (signal?.aborted) {
              throw new Error(signal.reason)
            }

            if (results.length === 0) {
              throw new Error(`${PRICE_APIS_META[priceApiId].name} EmptyResponse`)
            }

            const docIds: Array<{ id: string }> = []

            const documentMap = results.reduce((acc, result) => {
              const price = priceMapper(result)
              const timestamp = (price.time as number) * 1000
              const _id = `${assetId}-${timestamp}`

              acc[_id] = {
                _id,
                assetId,
                pair,
                price,
                timestamp,
              }

              docIds.push({ id: _id })
              return acc
            }, {} as Record<string, SavedPrice>)

            const { results: docsWithRevision } = await account.dailyPricesDB.bulkGet({
              docs: docIds,
            })

            const docs: SavedPrice[] = docsWithRevision.map((x) => ({
              ...documentMap[x.id],
              _rev: "ok" in x.docs[0] ? x.docs[0].ok._rev : undefined,
            }))

            const updates = await account.dailyPricesDB.bulkDocs(docs)
            validateOperation(updates)

            const start = (priceMapper(results[0]).time as number) * 1000
            const end = (priceMapper(results[results.length - 1]).time as number) * 1000

            progress([
              undefined,
              `Fetched ${getAssetTicker(assetId)} using ${
                PRICE_APIS_META[priceApiId].name
              } from ${formatDate(start)} to ${formatDate(end)}`,
            ])

            if (results.length !== PRICE_API_PAGINATION) {
              // reached listing date (genesis)
              break
            }

            until = start - 86400000
            since = start - 86400000 * PRICE_API_PAGINATION
          }
          break
        } catch (error) {
          progress([undefined, `Skipped ${getAssetTicker(assetId)}: ${error}`])
        }
      }
    })
  }

  let progressCount = 0

  await Promise.all(
    promises.map((fetchFn) =>
      fetchFn().then(() => {
        progressCount += 1
        progress([(progressCount / assetIds.length) * 100])
      })
    )
  )
}

export function subscribeToDailyPrices(callback: () => void, accountName: string) {
  const account = getAccount(accountName)

  const changesSub = account.dailyPricesDB
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
