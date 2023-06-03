import fs from "node:fs";

import { parse } from "csv-parse";
import Decimal from "decimal.js";

import { ServerTrade, TradeRole, TradeSide } from "./interfaces";

export async function readCsv<T>(
  filePath: string,
  transformer: (input: string[], index: number) => T
): Promise<T[]> {
  return new Promise((resolve) => {
    const tradeHistory: T[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ",", from_line: 2 })) // TODO: check this for consistency
      .on("data", (csvRow) => {
        tradeHistory.push(transformer(csvRow, tradeHistory.length));
      })
      .on("end", () => {
        // do something with csvData
        resolve(tradeHistory);
      });
  });
}

export function mexcTransformer(csvRow: string[], index: number): ServerTrade {
  const ticker = csvRow[0];
  const filledPrice = new Decimal(csvRow[3].split(" ")[0]);
  const amount = new Decimal(csvRow[4].split(" ")[0]);
  const symbol = ticker.split("_")[0];
  const baseSymbol = ticker.split("_")[1];
  const total = new Decimal(csvRow[5].split(" ")[0]);

  return {
    amount,
    baseSymbol,
    datetime: csvRow[1],
    fee: csvRow[6],
    filledPrice,
    id: index,
    role: csvRow[7] as TradeRole,
    side: csvRow[2] as TradeSide,
    symbol,
    total,
  };
}
