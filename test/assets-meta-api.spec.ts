import * as api from "src/api/core/assets-meta-api"
import { expect, it } from "vitest"

it("should have named exports", () => {
  expect(Object.keys(api)).toMatchInlineSnapshot(`
    [
      "findAssetsMeta",
    ]
  `)
})
