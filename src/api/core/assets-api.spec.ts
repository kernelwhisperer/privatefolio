import { expect, it } from "vitest"

import * as api from "./assets-api"

it("should have named exports", () => {
  expect(Object.keys(api)).toMatchInlineSnapshot(`
    [
      "findAssets",
    ]
  `)
})
