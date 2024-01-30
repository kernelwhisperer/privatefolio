import fs from "fs"
import { join } from "path"
import { findAuditLogs } from "src/api/account/audit-logs-api"
import { computeBalances, getHistoricalBalances } from "src/api/account/balances-api"
import { addFileImport } from "src/api/account/file-imports/file-imports-api"
import { findTransactions } from "src/api/account/transactions-api"
import { getAccount, resetAccount } from "src/api/database"
import { ProgressUpdate } from "src/stores/task-store"
import { beforeAll, expect, it } from "vitest"

const accountName = "turquoise"

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
        "assetIds": [
          "ethereum:0x0000000000000000000000000000000000000000:ETH",
        ],
        "integration": "ethereum",
        "logs": 545,
        "operations": [
          "Deposit",
          "Fee",
          "Withdraw",
        ],
        "rows": 482,
        "transactions": 482,
        "wallets": [
          "0x003dc32fe920a4aaeed12dc87e145f030aa753f3",
        ],
      },
    }
  `)
  expect(auditLogs.length).toMatchInlineSnapshot(`545`)
  for (let i = 0; i < auditLogs.length; i += 100) {
    expect(auditLogs.slice(i, i + 100)).toMatchFileSnapshot(
      `./__snapshots__/etherscan-import-2/audit-logs-normal-${i}.test.ts.snap`
    )
  }
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
        "assetIds": [
          "ethereum:0x0000000000000000000000000000000000000000:ETH",
          "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2:WETH",
        ],
        "integration": "ethereum",
        "logs": 61,
        "operations": [
          "Deposit",
          "Withdraw",
        ],
        "rows": 48,
        "transactions": 48,
        "wallets": [
          "0x003dc32fe920a4aaeed12dc87e145f030aa753f3",
        ],
      },
    }
  `)
  expect(auditLogs.length).toMatchInlineSnapshot(`61`)
  for (let i = 0; i < auditLogs.length; i += 100) {
    expect(auditLogs.slice(i, i + 100)).toMatchFileSnapshot(
      `./__snapshots__/etherscan-import-2/audit-logs-internal-${i}.test.ts.snap`
    )
  }
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
        "assetIds": [
          "ethereum:0x519475b31653e46d20cd09f9fdcf3b12bdacb4f5:VIU",
          "ethereum:0x52903256dd18d85c2dc4a6c999907c9793ea61e3:INSP",
          "ethereum:0x0abdace70d3790235af448c88547603b945604ea:DNT",
          "ethereum:0x0f5d2fb29fb7d3cfee444a200298f468908cc942:MANA",
          "ethereum:0x42d6622dece394b54999fbd73d108123806f6a18:SPANK",
          "ethereum:0x960b236a07cf122663c4303350609a66a7b288c0:ANT",
          "ethereum:0xa74476443119a942de498590fe1f2454d7d4ac0d:GNT",
          "ethereum:0xb9e7f8568e08d5659f5d29c4997173d84cdf2607:SWT",
          "ethereum:0xe4e5e5e15dd6bcebe489e5fabb4e8bf8e01684de:INT",
          "ethereum:0x6b01c3170ae1efebee1a3159172cb3f7a5ecf9e5:BOOTY",
          "ethereum:0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359:SAI",
          "ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2:WETH",
          "ethereum:0xd8d605151f55cd04827c3673c31ed3761fe7b6e9:MESH",
          "ethereum:0x2ff2b86c156583b1135c584fd940a1996fa4230b:ERC-20 TOKEN*",
          "ethereum:0x1ae5af661e9d8694038136751959070590db5ee4:SAFE",
          "ethereum:0xf5dce57282a584d2746faf1593d3121fcac444dc:cSAI",
          "ethereum:0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5:cETH",
          "ethereum:0x6b175474e89094c44da98b954eedeac495271d0f:DAI",
          "ethereum:0xc12d1c73ee7dc3615ba4e37e4abfdbddfa38907e:KICK",
          "ethereum:0x5d3a536e4d6dbd6114cc1ead35777bab948e3643:cDAI",
          "ethereum:0x88938e9358d763c7655e788d92c731ecc9153cc5:DMS",
          "ethereum:0xaaaf91d9b90df800df4f55c205fd6989c977e73a:TKN",
          "ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:USDC",
          "ethereum:0xcd62b1c403fa761baadfc74c525ce2b51780b184:ANJ",
          "ethereum:0x2f141ce366a2462f02cea3d12cf93e4dca49e4fd:FREE",
          "ethereum:0x0f8b6440a1f7be3354fe072638a5c0f500b044be:KTH",
          "ethereum:0x136fae4333ea36a24bb751e2d505d6ca4fd9f00b:ETHRSIAPY",
          "ethereum:0xbf70a33a13fbe8d0106df321da0cf654d2e9ab50:ETHBTCRSI7030",
          "ethereum:0xfc1e690f61efd961294b3e1ce3313fbd8aa4f85d:aDAI",
          "ethereum:0x9ba00d6856a4edf4665bca2c2309936572473b7e:aUSDC",
          "ethereum:0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8:yDAI+yUSDC+yUSDT+yTUSD",
          "ethereum:0x1985365e9f78359a9b6ad760e32412f4a445e862:REP",
          "ethereum:0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2:MKR",
          "ethereum:0xbbbbca6a901c926f240b89eacb641d8aec7aeafd:LRC",
          "ethereum:0x543ff227f64aa17ea132bf9886cab5db55dcaddf:GEN",
          "ethereum:0x1f9840a85d5af5bf1d1762f925bdaddc4201f984:UNI",
          "ethereum:0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e:YFI",
          "ethereum:0xba2e7fed597fd0e3e70f5130bcdbbfe06bb94fe1:yYFI",
          "ethereum:0xc2adda861f89bbb333c90c492cb837741916a225:UNI-V2",
          "ethereum:0x2fdbadf3c4d5a8666bc06645b8358ab803996e28:UNI-V2",
          "ethereum:0xd3d2e2692501a5c9ca623199d38826e513033a17:UNI-V2",
          "ethereum:0xd533a949740bb3306d119cc777fa900ba034cd52:CRV",
          "ethereum:0x35a18000230da775cac24873d00ff85bccded550:cUNI",
          "ethereum:0x7deb5e830be29f91e298ba5ff1356bb7f8146998:aMKR",
          "ethereum:0xc00e94cb662c3520282e6f5717214004a7f26888:COMP",
          "ethereum:0xaee2b2097ed86354abfd4e2361761794c6ddc07b:oETH $500 Call 11/20/20",
          "ethereum:0xc5bddf9843308380375a611c18b50fb9341f502a:yveCRV-DAO",
          "ethereum:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599:WBTC",
          "ethereum:0xc11b1268c1a384e55c48c2391d8d480264a3a7f4:cWBTC",
          "ethereum:0x429881672b9ae42b8eba0e26cd9c73711b891ca5:PICKLE",
          "ethereum:0x5d8d9f5b96f4438195be9b99eee6118ed4304286:COVER",
          "ethereum:0x088ee5007c98a9677165d78dd2109ae4a3d04d0c:SLP",
          "ethereum:0x4cf89ca06ad997bc732dc876ed2a7f26a9e7f361:MYST",
          "ethereum:0x71fbc1d795fcfbca43a3ebf6de0101952f31a410:ADAO",
          "ethereum:0x3472a5a71965499acd81997a54bba8d852c6e53d:BADGER",
          "ethereum:0xcd7989894bc033581532d2cd88da5db0a4b12859:UNI-V2",
          "ethereum:0x235c9e24d3fb2fafd58a2e49d454fdcd2dbf7ff1:bUNI-V2",
          "ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7:USDT",
          "ethereum:0x111111111117dc0aa78b770fa6a738034120c302:1INCH",
          "ethereum:0x6b3595068778dd592e39a122f4f5a5cf09c90fe2:SUSHI",
          "ethereum:0x798d1be841a82a273720ce31c822c61a67a601c3:DIGG",
          "ethereum:0xe86204c4eddd2f70ee00ead6805f917671f56c52:UNI-V2",
          "ethereum:0xc17078fdd324cc473f8175dc5290fae5f2e84714:bUNI-V2",
          "ethereum:0x6c3f90f043a72fa612cbac8115ee7e52bde6e490:3Crv",
          "ethereum:0x4688a8b1f292fdab17e9a90c8bc379dc1dbd8713:COVER",
          "ethereum:0xde30da39c46104798bb5aa3fe8b9e0e1f348163f:GTC",
          "ethereum:0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429:GLM",
          "ethereum:0xdb25ca703181e7484a155dd612b06f57e12be5f0:yvYFI",
        ],
        "integration": "ethereum",
        "logs": 419,
        "operations": [
          "Deposit",
          "Withdraw",
        ],
        "rows": 428,
        "transactions": 0,
        "wallets": [
          "0x003dc32fe920a4aaeed12dc87e145f030aa753f3",
        ],
      },
    }
  `)
  expect(auditLogs.length).toMatchInlineSnapshot(`419`)
  for (let i = 0; i < auditLogs.length; i += 100) {
    expect(auditLogs.slice(i, i + 100)).toMatchFileSnapshot(
      `./__snapshots__/etherscan-import-2/audit-logs-erc20-${i}.test.ts.snap`
    )
  }
})

it.sequential("should compute balances", async () => {
  // arrange
  const until = Date.UTC(2000, 0, 0, 0, 0, 0, 0) // 1 Jan 2000
  // act
  const updates: ProgressUpdate[] = []
  await computeBalances(accountName, { until }, (state) => updates.push(state))
  const balances = await getHistoricalBalances(accountName)
  const auditLogs = await findAuditLogs({}, accountName)
  const transactions = await findTransactions({}, accountName)
  // assert
  expect(updates.join("\n")).toMatchInlineSnapshot(`
    "0,Computing balances for 1025 audit logs
    0,Processing logs 1 to 1000
    87,Processed 1350 daily balances
    87,Processing logs 1001 to 1025
    90,Processed 622 daily balances
    95,Setting networth cursor to Dec 31, 1969
    96,Filling balances to reach today
    100,Saved 1972 records to disk"
  `)
  expect(balances.length).toMatchInlineSnapshot(`1971`)
  for (let i = 0; i < balances.length; i += 100) {
    expect(balances.slice(i, i + 100)).toMatchFileSnapshot(
      `./__snapshots__/etherscan-import-2/balances-${i}.test.ts.snap`
    )
  }
  expect(auditLogs.length).toMatchInlineSnapshot(`1025`)
  for (let i = 0; i < auditLogs.length; i += 100) {
    expect(auditLogs.slice(i, i + 100)).toMatchFileSnapshot(
      `./__snapshots__/etherscan-import-2/audit-logs-all-${i}.test.ts.snap`
    )
  }
  expect(transactions.length).toMatchInlineSnapshot(`530`)
  for (let i = 0; i < auditLogs.length; i += 100) {
    expect(transactions.slice(i, i + 100)).toMatchFileSnapshot(
      `./__snapshots__/etherscan-import-2/transactions-all-${i}.test.ts.snap`
    )
  }
})
