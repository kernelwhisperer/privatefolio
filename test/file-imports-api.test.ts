import fs from "fs"
import { join } from "path"
import { expect, it } from "vitest"

import { addFileImport } from "../src/api/account/file-imports/file-imports-api"
import { resetAccount } from "../src/api/database"

it("should add a file import", async () => {
  // arrange
  await resetAccount("main")
  const fileName = "coinmama.csv"
  const filePath = join(__dirname, "files", fileName)
  const buffer = await fs.promises.readFile(filePath, "utf8")
  const file = new File([buffer], fileName, { lastModified: 0, type: "text/csv" })
  // act
  const id = await addFileImport(file)
  // assert
  expect(id).toMatchInlineSnapshot(`
    {
      "_id": "1216384408",
      "metadata": {
        "integration": "coinmama",
        "logs": 1,
        "operations": [
          "Buy with Credit Card",
        ],
        "rows": 4,
        "symbols": [
          "BTC",
        ],
        "transactions": 1,
        "wallets": [
          "Spot",
        ],
      },
    }
  `)
})
