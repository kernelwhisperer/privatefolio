import Decimal from "decimal.js"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { ParsedTransaction, Transaction } from "../../utils/interfaces"
import { mexcParser, readCsv } from "../../utils/csv-utils"
import { AssetInfo } from "./AssetInfo"

const filePath = "/data/preview.csv"

export default function AssetPage() {
  const params = useParams()
  const assetSymbol = params.assetSymbol?.toLocaleUpperCase()

  const [tradeHistory, setTradeHistory] = useState<Transaction[]>([])
  const [amounts, setAmounts] = useState<any>({})
  console.log("📜 LOG > AssetPage > amounts:", amounts)

  useEffect(() => {
    readCsv<ParsedTransaction>(filePath, mexcParser).then((tradeHistory) => {
      const parsedTradeHistory = tradeHistory.filter((x) => x.symbol === assetSymbol)

      let amountBought = new Decimal(0)
      let amountSold = new Decimal(0)
      let moneyIn = new Decimal(0)
      let moneyOut = new Decimal(0)

      const frontendTradeHistory: Transaction[] = parsedTradeHistory.map((x) => {
        if (x.side === "BUY") {
          amountBought = amountBought.plus(x.amount)
          moneyIn = moneyIn.plus(x.total)
        } else {
          amountSold = amountSold.plus(x.amount)
          moneyOut = moneyOut.plus(x.total)
        }

        return {
          ...x,
          amount: x.amount.toNumber(),
          filledPrice: x.filledPrice.toNumber(),
          total: x.total.toNumber(),
        }
      })

      const holdings = amountBought.minus(amountSold)
      console.log("📜 LOG > readCsv<ServerTrade> > holdings:", holdings)
      const costBasis = moneyIn.div(amountBought)
      setTradeHistory(frontendTradeHistory)
      setAmounts({
        amountBought,
        amountSold,
        costBasis,
        holdings,
        moneyIn,
        moneyOut,
      })
    })
  }, [])

  return (
    <>
      {tradeHistory.length === 0 ? (
        "Loading..."
      ) : (
        <AssetInfo
          assetSymbol={assetSymbol}
          amountBought={amounts.amountBought.toNumber()}
          amountSold={amounts.amountSold.toNumber()}
          moneyIn={amounts.moneyIn.toNumber()}
          moneyOut={amounts.moneyOut.toNumber()}
          holdings={amounts.holdings.toNumber()}
          costBasis={amounts.costBasis.toNumber()}
          tradeHistory={tradeHistory}
        />
      )}
    </>
  )
}
