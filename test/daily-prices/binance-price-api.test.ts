import { mapToChartData, queryPrices } from "src/api/core/prices/binance-price-api"
import { ResolutionString } from "src/interfaces"
import { expect, it } from "vitest"

it("should fetch BTC prices within a range", async () => {
  // act
  const result = await queryPrices({
    limit: 3,
    pair: "BTCUSDT",
    since: 1502928000000,
    timeInterval: "1d" as ResolutionString,
    until: 1503100800000,
  })
  // assert
  expect(result.map(mapToChartData)).toMatchInlineSnapshot(`
    [
      {
        "close": 4285.08,
        "high": 4485.39,
        "low": 4200.74,
        "open": 4261.48,
        "time": 1502928000,
        "value": 4285.08,
        "volume": 795.150377,
      },
      {
        "close": 4108.37,
        "high": 4371.52,
        "low": 3938.77,
        "open": 4285.08,
        "time": 1503014400,
        "value": 4108.37,
        "volume": 1199.888264,
      },
      {
        "close": 4139.98,
        "high": 4184.69,
        "low": 3850,
        "open": 4108.37,
        "time": 1503100800,
        "value": 4139.98,
        "volume": 381.309763,
      },
    ]
  `)
})

it("should throw an error", async () => {
  // act
  const promise = queryPrices({
    pair: "EFJAUSDT",
    since: 0,
    timeInterval: "1d" as ResolutionString,
    // until: 0,
  })
  // assert
  await expect(promise).rejects.toMatchInlineSnapshot(`[Error: Binance: Invalid symbol. (-1121)]`)
})
