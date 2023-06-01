import React from "react";

import { Trade, TradeList } from "./components/HomePage/TradeList";
import { readCsv } from "./utils/utils";

const filePath = "data/preview.csv";

export default async function HomePage() {
  const tradeHistory = await readCsv<Trade>(filePath, (csvRow) => ({
    datetime: csvRow[1],
    executedAmount: csvRow[4],
    fee: csvRow[6],
    filledPrice: csvRow[3],
    role: csvRow[7] as any,
    side: csvRow[2] as any,
    symbol: csvRow[0].split("_")[0],
    ticker: csvRow[0],
    total: csvRow[5],
  }));
  // console.log("📜 LOG > tradeHistory:", tradeHistory[0]);
  return <TradeList tradeHistory={tradeHistory} />;
}
