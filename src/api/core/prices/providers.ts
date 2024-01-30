import { ChartData, PlatformId, QueryRequest } from "src/interfaces"

import * as binance from "./binance-price-api"
import * as coinbase from "./coinbase-price-api"
import * as llama from "./llama-price-api"

type PriceMapper = (data: any) => ChartData
type PairMapper = (symbol: string) => string
type PriceApi = (request: QueryRequest) => Promise<any>

export const PRICE_MAPPER: Partial<Record<PlatformId, PriceMapper>> = {
  [binance.Identifier]: binance.mapToChartData,
  [coinbase.Identifier]: coinbase.mapToChartData,
  [llama.Identifier]: llama.mapToChartData,
  coinmama: coinbase.mapToChartData,
}

export const PRICE_APIS: Partial<Record<PlatformId, PriceApi>> = {
  [binance.Identifier]: binance.queryPrices,
  [coinbase.Identifier]: coinbase.queryPrices,
  [llama.Identifier]: llama.queryPrices,
  coinmama: coinbase.queryPrices,
}

export const PAIR_MAPPER: Partial<Record<PlatformId, PairMapper>> = {
  [binance.Identifier]: binance.getPair,
  [coinbase.Identifier]: coinbase.getPair,
  [llama.Identifier]: llama.getPair,
  coinmama: coinbase.getPair,
}
