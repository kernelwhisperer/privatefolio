import { ChartData, PriceApiId, QueryRequest } from "src/interfaces"

import * as binance from "./binance-price-api"
import * as coinbase from "./coinbase-price-api"

type PriceMapper = (data: any) => ChartData
type PairMapper = (symbol: string) => string
type PriceApi = (request: QueryRequest) => Promise<any>

export const PRICE_MAPPER: Partial<Record<PriceApiId, PriceMapper>> = {
  [binance.Identifier]: binance.mapToChartData,
  [coinbase.Identifier]: coinbase.mapToChartData,
}

export const PRICE_APIS: Partial<Record<PriceApiId, PriceApi>> = {
  [binance.Identifier]: binance.queryPrices,
  [coinbase.Identifier]: coinbase.queryPrices,
}

export const PAIR_MAPPER: Partial<Record<PriceApiId, PairMapper>> = {
  [binance.Identifier]: binance.getPair,
  [coinbase.Identifier]: coinbase.getPair,
}
