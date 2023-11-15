import { readCsv } from "../utils/csv-utils"

const files = [
  "data/MEXC/Spot orders/Export Trade History-2021.csv",
  "data/MEXC/Spot orders/Export Trade History-2022.csv",
  // "data/Binance/2021.csv",
  // "data/Binance/2022.csv",
]

export async function getTransactions() {
  const transactionLists = await Promise.all(files.map(readCsv))
  return transactionLists.flat(1).sort((a, b) => b.timestamp - a.timestamp)
}
