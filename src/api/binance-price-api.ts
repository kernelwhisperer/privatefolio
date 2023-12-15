import { UTCTimestamp } from "lightweight-charts"

import { BinanceKline, ChartData, QueryRequest, ResolutionString } from "../interfaces"

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

export async function queryPrices(request: QueryRequest) {
  const { timeInterval, since, until, limit = 1000, pair } = request
  const binanceInterval = getInterval(timeInterval)

  let apiUrl = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${binanceInterval}&limit=${limit}`
  if (typeof since === "number") {
    const timestamp = since
    apiUrl = `${apiUrl}&startTime=${timestamp}`
  }
  if (typeof until === "number") {
    const timestamp = until
    apiUrl = `${apiUrl}&endTime=${timestamp}`
  }

  const res = await fetch(apiUrl)
  const data = (await res.json()) as BinanceKline[]
  return data
}

export function mapToChartData(kline: BinanceKline): ChartData {
  const open = parseFloat(kline[1])
  const high = parseFloat(kline[2])
  const low = parseFloat(kline[3])
  const close = parseFloat(kline[4])
  const volume = parseFloat(kline[5])
  const time = (kline[0] / 1000) as UTCTimestamp

  return {
    close,
    high,
    low,
    open,
    time,
    value: close,
    volume,
  }
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
