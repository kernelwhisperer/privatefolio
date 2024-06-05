import Big from "big.js"
import {
  AuditLog,
  BinanceConnection,
  ParserResult,
  Transaction,
  TransactionType,
} from "src/interfaces"

import { BinanceFuturesUSDTrades } from "../binance-account-api"

export function parseFuturesUSDTrade(
  row: BinanceFuturesUSDTrades,
  index: number,
  connection: BinanceConnection
): ParserResult {
  const { platform } = connection
  const { baseAsset, buyer, commission, commissionAsset, id, qty, quoteQty, quoteAsset, time } = row
  const wallet = `Binance USD-M Futures`
  const timestamp = new Date(Number(time)).getTime()
  if (isNaN(timestamp)) {
    throw new Error(`Invalid timestamp: ${time}`)
  }
  const txId = `${connection._id}_${id}_binance_${index}`
  const type: TransactionType = "Swap"
  const importId = connection._id
  const importIndex = index

  let incoming: string | undefined, incomingAsset: string | undefined, incomingN: number | undefined
  let outgoing: string | undefined, outgoingAsset: string | undefined, outgoingN: number | undefined
  let incomingBN: Big | undefined, outgoingBN: Big | undefined
  let logs: AuditLog[]

  if (buyer) {
    incomingBN = new Big(qty)
    incoming = incomingBN.toFixed()
    incomingN = incomingBN.toNumber()
    incomingAsset = `binance:${baseAsset}`
    outgoingBN = new Big(quoteQty)
    outgoing = outgoingBN.toFixed()
    outgoingN = outgoingBN.toNumber()
    outgoingAsset = `binance:${quoteAsset}`
    logs = [
      {
        _id: `${txId}_SELL`,
        assetId: outgoingAsset,
        change: `-${outgoing}`,
        changeN: -outgoingN,
        importId,
        importIndex,
        operation: "Sell",
        platform,
        timestamp,
        txId,
        wallet,
      },
      {
        _id: `${txId}_BUY`,
        assetId: incomingAsset,
        change: incoming,
        changeN: incomingN,
        importId,
        importIndex,
        operation: "Buy",
        platform,
        timestamp,
        txId,
        wallet,
      },
    ]
  } else {
    incomingBN = new Big(quoteQty)
    incoming = incomingBN.toFixed()
    incomingN = incomingBN.toNumber()
    incomingAsset = `binance:${quoteAsset}`
    outgoingBN = new Big(qty)
    outgoing = outgoingBN.toFixed()
    outgoingN = outgoingBN.toNumber()
    outgoingAsset = `binance:${baseAsset}`
    logs = [
      {
        _id: `${txId}_SELL`,
        assetId: outgoingAsset,
        change: `-${outgoing}`,
        changeN: -outgoingN,
        importId,
        importIndex,
        operation: "Sell",
        platform,
        timestamp,
        txId,
        wallet,
      },
      {
        _id: `${txId}_BUY`,
        assetId: incomingAsset,
        change: incoming,
        changeN: incomingN,
        importId,
        importIndex,
        operation: "Buy",
        platform,
        timestamp,
        txId,
        wallet,
      },
    ]
  }

  if (commission) {
    const feeBN = new Big(commission)
    logs.push({
      _id: `${txId}_FEE`,
      assetId: `binance:${commissionAsset}`,
      change: `-${feeBN.toFixed()}`,
      changeN: -feeBN.toNumber(),
      importId,
      importIndex,
      operation: "Fee",
      platform,
      timestamp,
      txId,
      wallet,
    })
  }

  const priceBN = incomingBN.div(outgoingBN)
  const tx: Transaction = {
    _id: txId,
    fee: commission === "0" ? undefined : commission,
    feeAsset: commission === "0" ? undefined : `binance:${commissionAsset}`,
    feeN: commission === "0" ? undefined : parseFloat(commission),
    importId,
    importIndex,
    incoming: incoming === "0" ? undefined : incoming,
    incomingAsset: incoming === "0" ? undefined : incomingAsset,
    incomingN: incoming === "0" ? undefined : incomingN,
    outgoing: outgoing === "0" ? undefined : outgoing,
    outgoingAsset: outgoing === "0" ? undefined : outgoingAsset,
    outgoingN: outgoing === "0" ? undefined : outgoingN,
    platform,
    price: priceBN.toFixed(),
    priceN: priceBN.toNumber(),
    timestamp,
    type,
    wallet,
  }

  return {
    logs,
    txns: [tx],
  }
}
