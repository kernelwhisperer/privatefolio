import fs from "fs"
import { join } from "path"
import { addFileImport } from "src/api/account/file-imports/file-imports-api"
import { fetchDailyPrices } from "src/api/core/daily-prices-api"
import { resetAccount } from "src/api/database"
import { ProgressUpdate } from "src/stores/task-store"
import { beforeAll, expect, it } from "vitest"

const accountName = "red"

beforeAll(async () => {
  //
  const folderPath = `test-db/${accountName}`
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
  //
  await resetAccount(accountName)
  //
  const fileName = "coinmama.csv"
  const filePath = join("test/files", fileName)
  const buffer = await fs.promises.readFile(filePath, "utf8")
  const file = new File([buffer], fileName, { lastModified: 0, type: "text/csv" })
  await addFileImport(file, undefined, accountName)
})

it("should fetch no prices", async () => {
  // act
  const updates: ProgressUpdate[] = []
  await fetchDailyPrices([], (state) => updates.push(state))
  // assert
  expect(updates.join("\n")).toMatchInlineSnapshot(`"0,Fetching asset prices for 0 symbols"`)
})

it.skip("should fetch BTC & ETH prices", async () => {
  // act
  const updates: ProgressUpdate[] = []
  await fetchDailyPrices(["BTC", "ETH"], (state) => updates.push(state))
  // assert
  expect(updates.join("\n")).toMatchInlineSnapshot(`
    "0,Fetching asset prices for 2 symbols
    50,Fetching BTC from genesis
    50,Fetching BTC from May 12, 2020
    50,Fetching BTC from Feb 05, 2023
    100,Fetching ETH from genesis
    100,Fetching ETH from May 12, 2020
    100,Fetching ETH from Feb 05, 2023"
  `) // TODO fix progress
})
