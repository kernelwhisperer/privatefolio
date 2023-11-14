import { Paper, Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import EnhancedTable, { HeadCell } from "../../components/EnhancedTable"
import { RobotoSerifFF } from "../../theme"
import { ServerTrade, Trade } from "../../utils/interfaces"
import { mexcTransformer, readCsv } from "../../utils/utils"

const filePath = "/data/preview.csv"

const headCells: readonly HeadCell<Trade>[] = [
  {
    disablePadding: true,
    id: "id",
    label: "Id",
  },
  {
    id: "datetime",
    label: "Datetime",
  },
  {
    id: "side",
    label: "Side",
  },
  {
    id: "filledPrice",
    label: "Price",
    numeric: true,
  },
  {
    id: "amount",
    label: "Amount",
    numeric: true,
  },
  {
    id: "total",
    label: "Total",
    numeric: true,
  },
]

export function TransactionsPage() {
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
        Transactions
      </Typography>
      {tradeHistory[0] && (
        <>
          <Paper variant="outlined">
            <Stack gap={2} direction="row">
              <span>{tradeHistory[0].datetime}</span>
              <span>Trade</span>
              <span>{tradeHistory[0].amount}</span>
              <span>{tradeHistory[0].side}</span>
              {/* <span>{tradeHistory[0].role}</span> */}
              {/* <span>{tradeHistory[0].fee}</span> */}
              <span>{tradeHistory[0].symbol}</span>
              <span>{tradeHistory[0].baseSymbol}</span>
              <span>{tradeHistory[0].total}</span>
            </Stack>
          </Paper>
        </>
      )}

      <>
        <EnhancedTable<Trade> rows={tradeHistory} headCells={headCells} />
      </>
    </Stack>
  )
}
