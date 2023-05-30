import fs from "node:fs";

import { parse } from "csv-parse";

export async function readCsv<T>(
  filePath: string,
  transformer: (input: string[]) => T
): Promise<T[]> {
  return new Promise((resolve) => {
    const tradeHistory: T[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ",", from_line: 2 })) // TODO: check this for consistency
      .on("data", (csvRow) => {
        tradeHistory.push(transformer(csvRow));
      })
      .on("end", () => {
        // do something with csvData
        resolve(tradeHistory);
      });
  });
}
