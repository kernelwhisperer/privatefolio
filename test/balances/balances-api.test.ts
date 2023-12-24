import fs from "fs"
import { join } from "path"
import { computeBalances, getHistoricalBalances } from "src/api/account/balances-api"
import { addFileImport } from "src/api/account/file-imports/file-imports-api"
import { resetAccount } from "src/api/database"
import { ProgressUpdate } from "src/stores/task-store"
import { beforeAll, expect, it } from "vitest"

const accountName = "blue"

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

it.sequential("should compute historical balances", async () => {
  // arrange
  const until = new Date(2017, 6, 28).getTime() // 28 July 2017
  // act
  const updates: ProgressUpdate[] = []
  await computeBalances({
    accountName,
    progress: (state) => updates.push(state),
    until,
  })
  // assert
  expect(updates.join("\n")).toMatchInlineSnapshot(`
    "0,Computing balances from 2 audit logs
    0,Processing logs 1 to 2
    90,Processing logs 1 to 2 complete
    95,Filling the balances to reach today
    100,Computed all balances!"
  `)
})

it.skip("should fetch historical balances", async () => {
  // arrange
  // act
  const balances = await getHistoricalBalances({ accountName })
  // assert
  expect(balances).toMatchSnapshot()
})
