import React from "react";

import TickerList from "./components/HomePage/TickerList";
import { readCsv } from "./utils/utils";

export interface Trade {
  datetime: string;
  executedAmount: string;
  fee: string;
  filledPrice: string;
  role: "Maker" | "Taker";
  side: "BUY" | "SELL";
  ticker: string;
  total: string;
}

const filePath =
  "data/history_transaction_recode_ecb12a29519d423a917ee4160ffba82e_1674930394870.csv";

export default async function HomePage() {
  const tradeHistory = await readCsv<Trade>(filePath, (csvRow) => ({
    datetime: csvRow[1],
    executedAmount: csvRow[4],
    fee: csvRow[6],
    filledPrice: csvRow[3],
    role: csvRow[7] as any,
    side: csvRow[2] as any,
    ticker: csvRow[0],
    total: csvRow[5],
  }));
  console.log("📜 LOG > tradeHistory:", tradeHistory[0]);
  return <TickerList tradeHistory={tradeHistory} />;
}
