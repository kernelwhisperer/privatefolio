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
  await computeBalances(undefined, undefined, {
    accountName,
    until,
  })
  await fetchDailyPrices({ symbols: ["BTC"] })
})

it.sequential("should compute historical networth", async () => {
  // arrange
  // act
  const updates: ProgressUpdate[] = []
  await computeNetworth((state) => updates.push(state), accountName)
  // assert
  expect(updates.join("\n")).toMatchInlineSnapshot(
    `
    "0,Computing historical networth for 14 total balances
    100,Computed all networth records!"
  `
  )
})

it.sequential("should fetch historical networth", async () => {
  // arrange
  // act
  const networthArray = await getHistoricalNetworth(accountName)
  // assert
  expect(networthArray.length).toMatchInlineSnapshot(`14`)
  expect(networthArray).toMatchSnapshot()
})
