import { Paper, Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { findAssets } from "../../api/assets-api"
import { getTransactions } from "../../api/tx-api"
import { Asset } from "../../interfaces"
import { RobotoSerifFF } from "../../theme"
import { Transaction } from "../../utils/interfaces"
import { AssetList } from "./AssetList"

export default function HomePage() {
  const [tradeHistory, setTradeHistory] = useState<Transaction[]>([])
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({})

  useEffect(() => {
    getTransactions().then(async (transactions) => {
      console.log("📜 LOG > getTransactions > transactions:", transactions)
      const symbolMap = {}
      transactions.forEach((x) => {
        symbolMap[x.symbol] = true
        symbolMap[x.feeSymbol] = true
        symbolMap[x.quoteSymbol] = true
      })
      setTradeHistory(transactions)
      const assets = await findAssets(symbolMap)
      setAssetMap(assets)
    })
  }, [])

  return (
    <Stack gap={2}>
      <Typography variant="h6" fontFamily={RobotoSerifFF}>
        Holdings
      </Typography>
      <Paper variant="outlined">
        <AssetList tradeHistory={tradeHistory} />
      </Paper>
    </Stack>
  )
}
