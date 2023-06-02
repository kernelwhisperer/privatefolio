export interface Trade extends Record<string, number | string> {
  amount: number;
  datetime: string;
  executedAmount: string;
  fee: string;
  filledPrice: number;
  id: number;
  role: "Maker" | "Taker";
  side: "BUY" | "SELL";
  symbol: string;
  ticker: string;
  total: number;
}
