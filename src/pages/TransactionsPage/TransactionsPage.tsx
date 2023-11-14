import { Stack, TablePagination, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { findAssets } from "../../api/assets-api"
import { Asset } from "../../interfaces"
import { RobotoSerifFF } from "../../theme"
import { ParsedTransaction, Transaction } from "../../utils/interfaces"
import { mexcParser, readCsv } from "../../utils/tx-utils"
import { TransactionCard } from "./TransactionCard"

const filePath = "/data/preview.csv"

export function TransactionsPage() {
  const [rows, setRows] = useState<Transaction[]>([])
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({})

  useEffect(() => {
    readCsv<ParsedTransaction>(filePath, mexcParser).then(async (tradeHistory) => {
      const symbolMap = {}
      const rows: Transaction[] = tradeHistory.map((x) => {
        symbolMap[x.symbol] = true
        symbolMap[x.feeSymbol] = true
        symbolMap[x.quoteSymbol] = true
        return {
          ...x,
          amount: x.amount.toNumber(),
          fee: x.fee.toNumber(),
          filledPrice: x.filledPrice.toNumber(),
          total: x.total.toNumber(),
          type: x.side === "BUY" ? "Buy" : "Sell",
        }
      })
      setRows(rows)
      console.log("📜 LOG > readCsv<ParsedTransaction> > rows:", rows.length)
      const assets = await findAssets(symbolMap)
      setAssetMap(assets)
    })
  }, [])

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)

  const visibleRows = React.useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage]
  )

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Stack gap={2}>
      <Typography variant="h6" fontFamily={RobotoSerifFF}>
        Transaction ledger
      </Typography>
      <Stack gap={0.5}>
        {visibleRows.map((tx) => (
          <TransactionCard key={tx.id} tx={tx} assetMap={assetMap} />
        ))}
      </Stack>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        showFirstButton
        showLastButton
      />
    </Stack>
  )
}
