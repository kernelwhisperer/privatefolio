import { addConnection, syncConnection } from "src/api/account/connections/connections-api"
import { resetAccount } from "src/api/database"
import { beforeAll, expect, it } from "vitest"

const accountName = "orange"

beforeAll(async () => {
  await resetAccount(accountName)
})

it.sequential("should add connection", async () => {
  // arrange
  const address = "0xf98C96B5d10faAFc2324847c82305Bd5fd7E5ad3"
  // act
  const connection = await addConnection(
    {
      address,
      integration: "ethereum",
      label: "",
    },
    accountName
  )
  // assert
  expect(connection._id).toMatchInlineSnapshot(`"431128919"`)
})

it.sequential("should sync connection", async () => {

  // act
  await syncConnection()
})
