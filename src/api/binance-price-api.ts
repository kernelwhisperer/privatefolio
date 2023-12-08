import { ResolutionString } from "../interfaces"
import { BinanceKline, Candle, QueryRequest, QueryResult } from "../primitives"

// https://binance-docs.github.io/apidocs/spot/en/#general-api-information
// The following intervalLetter values for headers:
// SECOND => S
// MINUTE => M
// HOUR => H
// DAY => D
// intervalNum describes the amount of the interval. For example, intervalNum 5 with intervalLetter M means "Every 5 minutes".
// The /api/v3/exchangeInfo rateLimits array contains objects related to the exchange's RAW_REQUESTS, REQUEST_WEIGHT, and ORDERS rate limits. These are further defined in the ENUM definitions section under Rate limiters (rateLimitType).
// A 429 will be returned when either request rate limit or order rate limit is violated.
function getInterval(timeInterval: ResolutionString) {
  // if (!supportedTimeframes.includes(timeframe)) {
  //   throw new Error(`Timeframe '${timeframe}' is not supported for this metric.`)
  // }
  return timeInterval
}

export async function queryPrices(request: QueryRequest): QueryResult {
  const { timeInterval, since, until, limit = 300, pair } = request
  const binanceInterval = getInterval(timeInterval)

  let apiUrl = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${binanceInterval}&limit=${limit}`
  if (since) {
    const timestamp = parseInt(since) * 1000
    apiUrl = `${apiUrl}&startTime=${timestamp}`
  }
  if (until) {
    const timestamp = parseInt(until) * 1000
    apiUrl = `${apiUrl}&endTime=${timestamp}`
  }

  const res = await fetch(apiUrl)
  const data = (await res.json()) as BinanceKline[]

  const candles: Candle[] = data.map((x) => ({
    close: x[4],
    high: x[2],
    low: x[3],
    open: x[1],
    timestamp: String(x[0] / 1000),
    volume: x[5],
  }))

  return candles
}

// export function createBinanceSubscribe(query: QueryFn) {
//   return function subscribe(request: SubscribeRequest): SubscribeResult {
//     const {
//       timeframe,
//       since,
//       onNewData,
//       priceUnit,
//       pollingInterval = DEFAULT_POLLING_INTERVAL,
//       variant,
//     } = request
//     let lastTimestamp = since

//     const intervalId = setInterval(async () => {
//       const data = await query({ priceUnit, since: lastTimestamp, timeframe, variant })

//       if (data.length) {
//         lastTimestamp = data[data.length - 1].timestamp
//         data.forEach(onNewData)
//       }
//     }, pollingInterval)

//     return function cleanup() {
//       clearInterval(intervalId)
//     }
//   }
// }
