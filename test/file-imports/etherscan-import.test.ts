import fs from "fs"
import { join } from "path"
import { findAuditLogs } from "src/api/account/audit-logs-api"
import { computeBalances, getHistoricalBalances } from "src/api/account/balances-api"
import { addFileImport } from "src/api/account/file-imports/file-imports-api"
import { findTransactions } from "src/api/account/transactions-api"
import { getAccount, resetAccount } from "src/api/database"
import { ProgressUpdate } from "src/stores/task-store"
import { beforeAll, expect, it } from "vitest"

const accountName = "azure"

beforeAll(async () => {
  //
  await resetAccount(accountName)
})

it("should add a file import", async () => {
  // arrange
  const fileName = "etherscan.csv"
  const filePath = join("test/files", fileName)
  const buffer = await fs.promises.readFile(filePath, "utf8")
  const file = new File([buffer], fileName, { lastModified: 0, type: "text/csv" })
  // act
  const fileImport = await addFileImport(file, undefined, accountName)
  const { docs: auditLogs } = await getAccount(accountName).auditLogsDB.find({
    selector: {
      importId: fileImport._id,
    },
  })
  auditLogs.sort((a, b) => b.timestamp - a.timestamp)
  // assert
  expect(fileImport).toMatchInlineSnapshot(`
    {
      "_id": "32174469",
      "metadata": {
        "assetIds": [
          "ethereum:0x0000000000000000000000000000000000000000:ETH",
        ],
        "logs": 16,
        "operations": [
          "Deposit",
          "Withdraw",
          "Fee",
        ],
        "platform": "ethereum",
        "rows": 9,
        "transactions": 9,
        "wallets": [
          "0xf98c96b5d10faafc2324847c82305bd5fd7e5ad3",
        ],
      },
    }
  `)
  expect(auditLogs.length).toMatchInlineSnapshot(`16`)
  expect(auditLogs).toMatchFileSnapshot(
    "./__snapshots__/etherscan-import/audit-logs-normal.test.ts.snap"
  )
})

it("should add an erc20 file import", async () => {
  // arrange
  const fileName = "etherscan-erc20.csv"
  const filePath = join("test/files", fileName)
  const buffer = await fs.promises.readFile(filePath, "utf8")
  const file = new File([buffer], fileName, { lastModified: 0, type: "text/csv" })
  // act
  const fileImport = await addFileImport(file, undefined, accountName, async () => ({
    userAddress: "0xf98c96b5d10faafc2324847c82305bd5fd7e5ad3",
  }))
  const { docs: auditLogs } = await getAccount(accountName).auditLogsDB.find({
    selector: {
      importId: fileImport._id,
    },
  })
  auditLogs.sort((a, b) => b.timestamp - a.timestamp)
  // assert
  expect(fileImport).toMatchInlineSnapshot(`
    {
      "_id": "3090763006",
      "metadata": {
        "assetIds": [
          "ethereum:0xab95e915c123fded5bdfb6325e35ef5515f1ea69:XNN",
          "ethereum:0x0cf0ee63788a0849fe5297f3407f701e122cc023:XDATA",
          "ethereum:0x519475b31653e46d20cd09f9fdcf3b12bdacb4f5:VIU",
          "ethereum:0x52903256dd18d85c2dc4a6c999907c9793ea61e3:INSP",
          "ethereum:0x1d462414fe14cf489c7a21cac78509f4bf8cd7c0:CAN",
          "ethereum:0xa4e8c3ec456107ea67d3075bf9e3df3a75823db0:LOOM",
          "ethereum:0x7b2f9706cd8473b4f5b7758b0171a9933fc6c4d6:HEALP",
          "ethereum:0x58b6a8a3302369daec383334672404ee733ab239:LPT",
        ],
        "logs": 8,
        "operations": [
          "Deposit",
        ],
        "platform": "ethereum",
        "rows": 8,
        "transactions": 0,
        "wallets": [
          "0xf98c96b5d10faafc2324847c82305bd5fd7e5ad3",
        ],
      },
    }
  `)
  expect(auditLogs.length).toMatchInlineSnapshot(`8`)
  expect(auditLogs).toMatchFileSnapshot(
    "./__snapshots__/etherscan-import/audit-logs-erc20.test.ts.snap"
  )
})

it.sequential("should compute balances", async () => {
  // arrange
  const until = Date.UTC(2021, 0, 0, 0, 0, 0, 0) // 1 Jan 2021
  // act
  const updates: ProgressUpdate[] = []
  await computeBalances(accountName, { until }, (state) => updates.push(state))
  const balances = await getHistoricalBalances(accountName)
  const auditLogs = await findAuditLogs({}, accountName)
  const transactions = await findTransactions({}, accountName)
  // assert
  expect(updates.join("\n")).toMatchInlineSnapshot(`
    "0,Computing balances for 24 audit logs
    0,Processing logs 1 to 24
    90,Processed 1153 daily balances
    95,Setting networth cursor to Dec 31, 1969
    96,Filling balances to reach today
    100,Saved 1210 records to disk"
  `)
  expect(balances.length).toMatchInlineSnapshot(`1210`)
  for (let i = 0; i < balances.length; i += 100) {
    expect(balances.slice(i, i + 100)).toMatchFileSnapshot(
      `./__snapshots__/etherscan-import/balances-${i}.test.ts.snap`
    )
  }
  expect(auditLogs.length).toMatchInlineSnapshot(`24`)
  expect(auditLogs).toMatchFileSnapshot(
    "./__snapshots__/etherscan-import/audit-logs-all.test.ts.snap"
  )
  expect(transactions.length).toMatchInlineSnapshot(`9`)
  expect(transactions).toMatchFileSnapshot(
    "./__snapshots__/etherscan-import/transactions-all.test.ts.snap"
  )
})
