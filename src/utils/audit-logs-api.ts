import { readCsv } from "../utils/csv-utils"

const files = [
  // "data/MEXC/Spot orders/Export Trade History-2021.csv",
  // "data/MEXC/Spot orders/Export Trade History-2022.csv",
  // "data/Binance/2017.csv",
  // "data/Binance/2018.csv",
  "data/Binance/2018.csv",
  "data/Binance/2023_nov.csv",
]

export async function getAuditLogs() {
  const auditLogLists = await Promise.all(files.map(readCsv))
  return auditLogLists.flat(1).sort((a, b) => b.timestamp - a.timestamp)
}
