import Big from "big.js"
import { AuditLog, BinanceConnection, ParserResult } from "src/interfaces"

import { BinanceMarginTransfer } from "../binance-account-api"

export function parseMarginTransfer(
  row: BinanceMarginTransfer,
  index: number,
  connection: BinanceConnection
): ParserResult {
  const { platform } = connection
  const { amount, asset, fromSymbol, timestamp: time, toSymbol, transFrom, transTo, txId: id } = row
  const timestamp = new Date(Number(time)).getTime()
  if (isNaN(timestamp)) {
    throw new Error(`Invalid timestamp: ${time}`)
  }
  const txId = `${connection._id}_${id}_binance_${index}`
  const importId = connection._id
  const importIndex = index

  const changeBN = new Big(amount)
  const change = changeBN.toFixed()
  const changeN = changeBN.toNumber()
  const incomingAsset = `binance:${asset}`

  const logs: AuditLog[] = [
    {
      _id: `${txId}_Transfer_From`,
      assetId: incomingAsset,
      change,
      changeN,
      importId,
      importIndex,
      operation: "Transfer",
      platform,
      timestamp,
      txId,
      wallet: `Binance ${(transFrom.charAt(0) + transFrom.substring(1).toLowerCase()).replace(
        "_",
        " "
      )}`,
    },
    {
      _id: `${txId}_Transfer_To`,
      assetId: incomingAsset,
      change: `-${change}`,
      changeN: -changeN,
      importId,
      importIndex,
      operation: "Transfer",
      platform,
      timestamp,
      txId,
      wallet: `Binance ${(transTo.charAt(0) + transTo.substring(1).toLowerCase()).replace(
        "_",
        " "
      )}`,
    },
  ]
  return {
    logs,
  }
}
