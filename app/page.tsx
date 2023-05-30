import { groupBy } from "lodash";
import React from "react";

import { readCsv } from "./utils";

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

export default async function TickerList() {
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
  const groupedTrades = groupBy(tradeHistory, "ticker");
  console.log("📜 LOG > groupedTrades:", groupedTrades);
  return (
    <div>
      <table aria-label="simple table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th align="right">No. of trades</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedTrades).map((tradeGroup) => (
            <tr key={tradeGroup}>
              <td>{tradeGroup}</td>
              <td align="right">{groupedTrades[tradeGroup].length}</td>
              <td align="right"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
