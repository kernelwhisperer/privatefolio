import { Stack, TablePagination, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { getAuditLogs } from "../../api/audit-logs-api"
import { Asset, Transaction } from "../../interfaces"
import { SerifFont } from "../../theme"
import { TransactionCard } from "./TransactionCard"

export function TransactionsPage() {
  const [rows, setRows] = useState<Transaction[]>([])
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({})

  useEffect(() => {
    getAuditLogs().then(async (transactions) => {
      setRows(transactions)
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
      <Typography variant="h6" fontFamily={SerifFont}>
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
