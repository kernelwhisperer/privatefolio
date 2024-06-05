import Big from "big.js"
import {
  AuditLog,
  BinanceConnection,
  ParserResult,
  Transaction,
  TransactionType,
} from "src/interfaces"

import { BinanceMarginTrade } from "../binance-account-api"

export function parseMarginTrade(
  row: BinanceMarginTrade,
  index: number,
  connection: BinanceConnection
): ParserResult {
  const { platform } = connection
  const {
    baseAsset,
    commission,
    commissionAsset,
    id,
    isBuyer,
    isIsolated,
    price,
    qty,
    quoteAsset,
    time,
  } = row

  const wallet = isIsolated ? `Binance Isolated Margin` : `Binance Cross Margin`
  const timestamp = new Date(Number(time)).getTime()
  if (isNaN(timestamp)) {
    throw new Error(`Invalid timestamp: ${time}`)
  }
  const txId = `${connection._id}_${id}_binance_${index}`
  const type: TransactionType = "Swap"
  const importId = connection._id
  const importIndex = index

  const feeBN = new Big(commission)
  const qtyBN = new Big(qty)
  const priceBN = new Big(price)
  const quoteQtyBN = qtyBN.times(priceBN)

  let incoming: string | undefined, incomingAsset: string | undefined, incomingN: number | undefined
  let outgoing: string | undefined, outgoingAsset: string | undefined, outgoingN: number | undefined
  let logs: AuditLog[]

  if (isBuyer) {
    incoming = qtyBN.toFixed()
    incomingN = qtyBN.toNumber()
    incomingAsset = `binance:${baseAsset}`
    outgoing = quoteQtyBN.toFixed()
    outgoingN = quoteQtyBN.toNumber()
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
    incoming = quoteQtyBN.toFixed()
    incomingN = quoteQtyBN.toNumber()
    incomingAsset = `binance:${quoteAsset}`
    outgoing = qtyBN.toFixed()
    outgoingN = qtyBN.toNumber()
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
  const txnPriceN = incomingN / outgoingN
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
    price: txnPriceN.toString(),
    priceN: txnPriceN,
    timestamp,
    type,
    wallet,
  }

  return {
    logs,
    txns: [tx],
  }
}
