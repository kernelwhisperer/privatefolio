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
  const fileName = "etherscan2.csv"
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
      "_id": "186018469",
      "metadata": {
        "integration": "ethereum",
        "logs": 545,
        "operations": [
          "Deposit",
          "Fee",
          "Withdraw",
        ],
        "rows": 482,
        "symbols": [
          "ETH",
        ],
        "transactions": 482,
        "wallets": [
          "Spot",
        ],
      },
    }
  `)
  expect(auditLogs.length).toMatchInlineSnapshot(`545`)
  expect(auditLogs).toMatchSnapshot()
})

it("should add an internal file import", async () => {
  // arrange
  const fileName = "etherscan2-internal.csv"
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
      "_id": "3141079563",
      "metadata": {
        "integration": "ethereum",
        "logs": 48,
        "operations": [
          "Deposit",
        ],
        "rows": 48,
        "symbols": [
          "ETH",
        ],
        "transactions": 48,
        "wallets": [
          "Spot",
        ],
      },
    }
  `)
  expect(auditLogs.length).toMatchInlineSnapshot(`48`)
  expect(auditLogs).toMatchSnapshot()
})

it("should add an erc20 file import", async () => {
  // arrange
  const fileName = "etherscan2-erc20.csv"
  const filePath = join("test/files", fileName)
  const buffer = await fs.promises.readFile(filePath, "utf8")
  const file = new File([buffer], fileName, { lastModified: 0, type: "text/csv" })
  // act
  const fileImport = await addFileImport(file, undefined, accountName, async () => ({
    userAddress: "0x003dC32fE920a4aAeeD12dC87E145F030aa753f3",
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
      "_id": "1155767893",
      "metadata": {
        "integration": "ethereum",
        "logs": 419,
        "operations": [
          "Deposit",
          "Withdraw",
        ],
        "rows": 428,
        "symbols": [
          "VIU",
          "INSP",
          "DNT",
          "MANA",
          "SPANK",
          "ANT",
          "GNT",
          "SWT",
          "INT",
          "BOOTY",
          "SAI",
          "WETH",
          "MESH",
          "ERC-20 TOKEN*",
          "SAFE",
          "cSAI",
          "cETH",
          "DAI",
          "KICK",
          "cDAI",
          "DMS",
          "TKN",
          "USDC",
          "ANJ",
          "FREE",
          "KTH",
          "ETHRSIAPY",
          "ETHBTCRSI7030",
          "aDAI",
          "aUSDC",
          "yDAI+yUSDC+yUSDT+yTUSD",
          "REP",
          "MKR",
          "LRC",
          "GEN",
          "UNI",
          "YFI",
          "yYFI",
          "UNI-V2",
          "CRV",
          "cUNI",
          "aMKR",
          "COMP",
          "oETH $500 Call 11/20/20",
          "yveCRV-DAO",
          "WBTC",
          "cWBTC",
          "PICKLE",
          "COVER",
          "SLP",
          "MYST",
          "ADAO",
          "BADGER",
          "bUNI-V2",
          "USDT",
          "1INCH",
          "SUSHI",
          "DIGG",
          "3Crv",
          "GTC",
          "GLM",
          "yvYFI",
        ],
        "transactions": 0,
        "wallets": [
          "Spot",
        ],
      },
    }
  `)
  expect(auditLogs.length).toMatchInlineSnapshot(`419`)
  expect(auditLogs).toMatchFileSnapshot("./__snapshots__/etherscan-import-2-erc20.test.ts.snap")
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
    "0,Computing balances for 1012 audit logs
    0,Processing logs 1 to 1000
    88,Processed 1762 daily balances
    88,Processing logs 1001 to 1012
    90,Processed 210 daily balances
    95,Setting networth cursor to Dec 31, 1969
    96,Filling balances to reach today
    100,Saved 1972 records to disk"
  `)
  expect(balances.length).toMatchInlineSnapshot(`1971`)
  expect(balances).toMatchFileSnapshot("./__snapshots__/etherscan-import-2-balances.test.ts.snap")
  expect(auditLogs.length).toMatchInlineSnapshot(`1012`)
  expect(auditLogs).toMatchFileSnapshot(
    "./__snapshots__/etherscan-import-2-audit-logs.test.ts.snap"
  )
  expect(transactions.length).toMatchInlineSnapshot(`530`)
  expect(transactions).toMatchFileSnapshot(
    "./__snapshots__/etherscan-import-2-transactions.test.ts.snap"
  )
})
