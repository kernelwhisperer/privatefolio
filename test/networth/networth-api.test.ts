import fs from "fs"
import { join } from "path"
import { computeBalances } from "src/api/account/balances-api"
import { addFileImport } from "src/api/account/file-imports/file-imports-api"
import { computeNetworth, getHistoricalNetworth } from "src/api/account/networth-api"
import { fetchDailyPrices } from "src/api/core/daily-prices-api"
import { resetAccount } from "src/api/database"
import { ProgressUpdate } from "src/stores/task-store"
import { beforeAll, expect, it } from "vitest"

const accountName = "green"

beforeAll(async () => {
  //
  await resetAccount(accountName)
  //
  const fileName = "coinmama.csv"
  const filePath = join("test/files", fileName)
  const buffer = await fs.promises.readFile(filePath, "utf8")
  const file = new File([buffer], fileName, { lastModified: 0, type: "text/csv" })
  await addFileImport(file, undefined, accountName)
  const until = Date.UTC(2017, 8, 14, 0, 0, 0, 0) // 14 Sep 2017
  await computeBalances(accountName, { until })
  await fetchDailyPrices({ priceApiId: "coinbase", symbols: ["BTC"] })
})

it.sequential("should compute historical networth", async () => {
  // arrange
  // act
  const updates: ProgressUpdate[] = []
  await computeNetworth(accountName, 0, (state) => updates.push(state))
  const networthArray = await getHistoricalNetworth(accountName)
  // assert
  expect(updates.join("\n")).toMatchInlineSnapshot(
    `
    "5,Computing networth for 14 days
    10,Computing networth starting Sep 01, 2017
    99,Setting networth cursor to Sep 14, 2017"
  `
  )
  expect(networthArray.length).toMatchInlineSnapshot(`14`)
  expect(networthArray).toMatchSnapshot()
})

it.sequential("should refresh networth", async () => {
  // arrange
  // act
  const updates: ProgressUpdate[] = []
  await computeNetworth(accountName, undefined, (state) => updates.push(state))
  const networthArray = await getHistoricalNetworth(accountName)
  // assert
  expect(updates.join("\n")).toMatchInlineSnapshot(`
    "5,Computing networth for 1 days
    10,Computing networth starting Sep 14, 2017
    99,Setting networth cursor to Sep 14, 2017"
  `)
  expect(networthArray.length).toMatchInlineSnapshot(`14`)
  expect(networthArray).toMatchSnapshot()
})
