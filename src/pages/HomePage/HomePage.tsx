import { Paper, Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { RobotoSerifFF } from "../../theme"
import { ParsedTransaction, Transaction } from "../../utils/interfaces"
import { mexcParser, readCsv } from "../../utils/tx-utils"
import { AssetList } from "./AssetList"

const filePath = "/data/preview.csv"

export default function HomePage() {
  const [tradeHistory, setTradeHistory] = useState<Transaction[]>([])

  useEffect(() => {
    readCsv<ParsedTransaction>(filePath, mexcParser).then((tradeHistory) => {
      const frontendTradeHistory: Transaction[] = tradeHistory.map((x) => {
        return {
          ...x,
          amount: x.amount.toNumber(),
          filledPrice: x.filledPrice.toNumber(),
          total: x.total.toNumber(),
        }
      })
      setTradeHistory(frontendTradeHistory)
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
