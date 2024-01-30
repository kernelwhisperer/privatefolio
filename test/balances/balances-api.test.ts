import fs from "fs"
import { join } from "path"
import { findAuditLogs } from "src/api/account/audit-logs-api"
import { computeBalances, getBalancesAt, getHistoricalBalances } from "src/api/account/balances-api"
import { addFileImport } from "src/api/account/file-imports/file-imports-api"
import { getValue } from "src/api/account/kv-api"
import { fetchDailyPrices } from "src/api/core/daily-prices-api"
import { resetAccount } from "src/api/database"
import { Timestamp } from "src/interfaces"
import { ProgressUpdate } from "src/stores/task-store"
import { beforeAll, expect, it } from "vitest"

const accountName = "blue"

beforeAll(async () => {
  //
  await resetAccount(accountName)
  //
  const fileName = "coinmama.csv"
  const filePath = join("test/files", fileName)
  const buffer = await fs.promises.readFile(filePath, "utf8")
  const file = new File([buffer], fileName, { lastModified: 0, type: "text/csv" })
  await addFileImport(file, undefined, accountName)
})

it.sequential("should not have balances computed", async () => {
  // act
  const auditLogs = await findAuditLogs({}, accountName)
  // assert
  expect(auditLogs).toMatchSnapshot()
})

it.sequential("should compute historical balances", async () => {
  // arrange
  const until = Date.UTC(2017, 8, 14, 0, 0, 0, 0) // 14 Sep 2017
  // act
  const updates: ProgressUpdate[] = []
  await computeBalances(accountName, { until }, (state) => updates.push(state))
  // assert
  const balancesCursor = await getValue<Timestamp>("balancesCursor", 0, accountName)
  expect(balancesCursor).toBe(until)
  expect(updates.join("\n")).toMatchInlineSnapshot(`
    "0,Computing balances for 2 audit logs
    0,Processing logs 1 to 2
    90,Processed 7 daily balances
    95,Setting networth cursor to Dec 31, 1969
    96,Filling balances to reach today
    100,Saved 14 records to disk"
  `)
})

it.sequential("should re-compute today's balances", async () => {
  // arrange
  const until = Date.UTC(2017, 8, 14, 0, 0, 0, 0) // 14 Sep 2017
  // act
  const updates: ProgressUpdate[] = []
  await computeBalances(
    accountName,
    {
      since: 1504742400000,
      until,
    },
    (state) => updates.push(state)
  )
  // assert
  const balancesCursor = await getValue<Timestamp>("balancesCursor", 0, accountName)
  expect(balancesCursor).toBe(until)
  expect(updates.join("\n")).toMatchInlineSnapshot(`
    "0,Refreshing balances starting Sep 07, 2017
    0,Computing balances for 1 audit logs
    0,Processing logs 1 to 1
    90,Processed 1 daily balances
    95,Setting networth cursor to Sep 06, 2017
    96,Filling balances to reach today
    100,Saved 8 records to disk"
  `)
})

it.sequential("should fetch historical balances", async () => {
  // arrange
  // act
  const balances = await getHistoricalBalances(accountName)
  // assert
  expect(balances.length).toMatchInlineSnapshot(`14`)
  expect(balances).toMatchSnapshot()
})

it.sequential("should have balances computed", async () => {
  // act
  const auditLogs = await findAuditLogs({}, accountName)
  // assert
  expect(auditLogs).toMatchSnapshot()
})

it.sequential("should fetch latest balances without price data", async () => {
  // arrange
  // act
  const balances = await getBalancesAt(undefined, accountName)
  // assert
  expect(balances).toMatchSnapshot()
})

it.sequential("should fetch latest balances with price data", async () => {
  // arrange
  await fetchDailyPrices({ assetIds: ["coinmama:BTC"] })
  // act
  const balances = await getBalancesAt(undefined, accountName)
  // assert
  expect(balances).toMatchSnapshot()
})
