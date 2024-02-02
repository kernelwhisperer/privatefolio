import fs from "fs"
import { join } from "path"
import { addFileImport } from "src/api/account/file-imports/file-imports-api"
import { resetAccount } from "src/api/database"
import { beforeAll, expect, it } from "vitest"

const accountName = "yellow"

beforeAll(async () => {
  //
  await resetAccount(accountName)
})

it("should add a file import", async () => {
  // arrange
  const fileName = "coinmama.csv"
  const filePath = join("test/files", fileName)
  const buffer = await fs.promises.readFile(filePath, "utf8")
  const file = new File([buffer], fileName, { lastModified: 0, type: "text/csv" })
  // act
  const id = await addFileImport(file, undefined, accountName)
  // assert
  expect(id).toMatchInlineSnapshot(`
    {
      "_id": "2675435331",
      "metadata": {
        "assetIds": [
          "coinmama:BTC",
        ],
        "integration": "coinmama",
        "logs": 2,
        "operations": [
          "Buy with Credit Card",
        ],
        "platform": "coinmama",
        "rows": 5,
        "transactions": 2,
        "wallets": [
          "Coinmama Spot",
        ],
      },
    }
  `)
})
