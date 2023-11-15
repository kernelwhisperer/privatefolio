import { Stack, TablePagination, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { findAssets } from "../../api/assets-api"
import { getAuditLogs } from "../../api/audit-logs-api"
import { Asset, AuditLog } from "../../interfaces"
import { RobotoSerifFF } from "../../theme"
import { AuditLogCard } from "./AuditLogCard"

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditLog[]>([])
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({})

  useEffect(() => {
    getAuditLogs().then(async (auditLogs) => {
      console.log("📜 LOG > getTransactions > transactions:", auditLogs)
      const symbolMap = {}
      auditLogs.forEach((x) => {
        symbolMap[x.symbol] = true
      })
      setRows(auditLogs)
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
        Audit logs
      </Typography>
      <Stack
        sx={{
          "& > * + *": {
            borderTop: "1px solid var(--mui-palette-divider)",
          },
          border: "1px solid var(--mui-palette-divider)",
        }}
      >
        {visibleRows.map((x) => (
          <AuditLogCard key={x.id} auditLog={x} assetMap={assetMap} />
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