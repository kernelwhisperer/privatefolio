import { Paper, Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { RobotoSerifFF } from "../../theme"
import { ServerTrade, Trade } from "../../utils/interfaces"
import { mexcTransformer, readCsv } from "../../utils/utils"
import { AssetList } from "./AssetList"

const filePath = "/data/preview.csv"

export default function HomePage() {
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([])

  useEffect(() => {
    readCsv<ServerTrade>(filePath, mexcTransformer).then((tradeHistory) => {
      const frontendTradeHistory: Trade[] = tradeHistory.map((x) => {
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
