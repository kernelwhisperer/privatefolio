import { findAuditLogs } from "src/api/account/audit-logs-api"
import { computeBalances, getHistoricalBalances } from "src/api/account/balances-api"
import { addConnection, syncConnection } from "src/api/account/connections/connections-api"
import { findTransactions } from "src/api/account/transactions-api"
import { resetAccount } from "src/api/database"
import { Connection } from "src/interfaces"
import { ProgressUpdate } from "src/stores/task-store"
import {
  normalizeTransaction,
  sanitizeAuditLog,
  sanitizeBalance,
  trimTxId,
} from "src/utils/test-utils"
import { beforeAll, describe, expect, it } from "vitest"

const accountName = "grey"

beforeAll(async () => {
  await resetAccount(accountName)
})

let connection: Connection

describe("should import 0x003dc via connection", () => {
  it.sequential("should add the connection", async () => {
    // arrange
    const address = "0x003dc32fe920a4aaeed12dc87e145f030aa753f3"
    // act
    connection = await addConnection(
      {
        address,
        label: "",
        platform: "ethereum",
      },
      accountName
    )
    // assert
    expect(connection._id).toMatchInlineSnapshot(`"2351606471"`)
  })

  it.sequential("should sync connection", async () => {
    // arrange
    const updates: ProgressUpdate[] = []
    // act
    await syncConnection((state) => updates.push(state), connection, accountName)
    // assert
    // assert
    expect(updates.join("\n")).toMatchInlineSnapshot(`
      "0,Starting from block number 0
      0,Fetching normal transactions
      10,Parsing 482 normal transactions
      25,Fetching internal transactions
      35,Parsing 48 internal transactions
      50,Fetching erc20 transactions
      60,Parsing 428 erc20 transactions
      80,Saving 1024 audit logs to disk
      90,Saving 948 transactions to disk
      95,Setting cursor to block number 16727787
      99,Saving metadata"
    `)
  })

  it.sequential("should compute balances", async () => {
    // arrange
    const until = Date.UTC(2021, 0, 0, 0, 0, 0, 0) // 1 Jan 2021
    const updates: ProgressUpdate[] = []
    // act
    await computeBalances(accountName, { until }, (state) => updates.push(state))
    // assert
    expect(updates.join("\n")).toMatchInlineSnapshot(`
      "0,Computing balances for 1024 audit logs
      0,Processing logs 1 to 1000
      87,Processed 1350 daily balances
      87,Processing logs 1001 to 1024
      90,Processed 621 daily balances
      95,Setting networth cursor to Dec 31, 1969
      96,Filling balances to reach today
      100,Saved 1971 records to disk"
    `)
  })

  it.sequential("should save the correct data", async () => {
    // act
    const auditLogs = await findAuditLogs({}, accountName)
    const transactions = await findTransactions({}, accountName)
    const balances = await getHistoricalBalances(accountName)
    // assert
    expect(transactions.length).toMatchInlineSnapshot(`948`)
    expect(
      transactions
        .sort((a, b) => {
          const delta = b.timestamp - a.timestamp

          if (delta === 0) {
            return trimTxId(a._id, a.platform).localeCompare(trimTxId(b._id, b.platform))
          }

          return delta
        })
        .map(normalizeTransaction)
    ).toMatchFileSnapshot("../__snapshots__/0x003dc/transactions.ts.snap")
    expect(auditLogs.length).toMatchInlineSnapshot(`1024`)
    expect(auditLogs.map(sanitizeAuditLog)).toMatchFileSnapshot(
      "../__snapshots__/0x003dc/audit-logs.ts.snap"
    )
    expect(balances.length).toMatchInlineSnapshot(`1971`)
    for (let i = 0; i < balances.length; i += 100) {
      expect(balances.slice(i, i + 100).map(sanitizeBalance)).toMatchFileSnapshot(
        `../__snapshots__/0x003dc/balances-${i}.ts.snap`
      )
    }
  })
})