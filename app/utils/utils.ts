import fs from "node:fs";

import { parse } from "csv-parse";

import { Trade } from "./interfaces";

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

export function mexcTransformer(csvRow: string[], index: number): Trade {
  const ticker = csvRow[0];
  const filledPrice = parseFloat(csvRow[3]);
  const amount = parseFloat(csvRow[4]);

  return {
    amount,
    datetime: csvRow[1],
    executedAmount: csvRow[4],
    fee: csvRow[6],
    filledPrice,
    filledPriceSymbol: csvRow[3].split(" ")[1],
    id: index, // `${csvRow[1]}_${index}`,
    role: csvRow[7] as any,
    side: csvRow[2] as any,
    symbol: ticker.split("_")[0],
    ticker,
    total: parseFloat(csvRow[5]),
  };
}
