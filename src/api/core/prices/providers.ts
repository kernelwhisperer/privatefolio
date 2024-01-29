import { ChartData, PriceApiId, QueryRequest } from "src/interfaces"

import * as binance from "./binance-price-api"
import * as coinbase from "./coinbase-price-api"
import * as llama from "./llama-price-api"

type PriceMapper = (data: any) => ChartData
type PairMapper = (symbol: string) => string
type PriceApi = (request: QueryRequest) => Promise<any>

export const PRICE_MAPPER: Partial<Record<PriceApiId, PriceMapper>> = {
  [binance.Identifier]: binance.mapToChartData,
  [coinbase.Identifier]: coinbase.mapToChartData,
  [llama.Identifier]: llama.mapToChartData,
}

export const PRICE_APIS: Partial<Record<PriceApiId, PriceApi>> = {
  [binance.Identifier]: binance.queryPrices,
  [coinbase.Identifier]: coinbase.queryPrices,
  [llama.Identifier]: llama.queryPrices,
}

export const PAIR_MAPPER: Partial<Record<PriceApiId, PairMapper>> = {
  [binance.Identifier]: binance.getPair,
  [coinbase.Identifier]: coinbase.getPair,
  [llama.Identifier]: llama.getPair,
}
