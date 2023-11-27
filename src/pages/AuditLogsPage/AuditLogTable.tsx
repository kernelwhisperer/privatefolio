import { Paper } from "@mui/material"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import MuiTableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import React, { ChangeEvent, MouseEvent, useCallback, useMemo, useState } from "react"

import { Asset, AuditLog, Exchange } from "../../interfaces"
import { getComparator, Order } from "../../utils/table-utils"
import { AuditLogTableHead, AuditLogTableHeadProps } from "./AuditLogTableHead"
import { AuditLogTableRow } from "./AuditLogTableRow"

type SortableKeys = keyof AuditLog

interface HeadCell {
  filterable?: boolean
  key: SortableKeys
  label: string
  numeric?: boolean
}

const HEAD_CELLS: HeadCell[] = [
  {
    key: "timestamp",
    label: "Timestamp",
  },
  {
    filterable: true,
    key: "integration",
    label: "Integration",
  },
  {
    filterable: true,
    key: "wallet",
    label: "Wallet",
  },
  {
    filterable: true,
    key: "operation",
    label: "Operation",
  },
  {
    key: "changeN",
    label: "Change",
    numeric: true,
  },
  {
    filterable: true,
    key: "symbol",
    label: "Asset",
  },
  {
    key: "balance",
    label: "New balance",
    numeric: true,
  },
]

function TableHead(props: Omit<AuditLogTableHeadProps, "headCell">) {
  return (
    <MuiTableHead
      sx={{
        background: "var(--mui-palette-background-paper)",
        height: 52,
        position: "sticky",
        top: 0,
        zIndex: 2,
      }}
    >
      <TableRow>
        {HEAD_CELLS.map((headCell, index) => (
          <TableCell
            key={index}
            padding="normal"
            sortDirection={props.orderBy === headCell.key ? props.order : false}
          >
            <AuditLogTableHead headCell={headCell} {...props} />
          </TableCell>
        ))}
      </TableRow>
    </MuiTableHead>
  )
}

type AuditLogsTableProps = {
  assetMap: Record<string, Asset>
  integrationMap: Record<string, Exchange>
  rows: AuditLog[]
}

export function AuditLogsTable(props: AuditLogsTableProps) {
  const { rows, assetMap, integrationMap } = props
  const [order, setOrder] = useState<Order>("desc")
  const [orderBy, setOrderBy] = useState<SortableKeys>("timestamp")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [relativeTime, setRelativeTime] = useState(true)

  const handleSort = useCallback(
    (_event: MouseEvent<unknown>, property: SortableKeys) => {
      const isAsc = orderBy === property && order === "asc"
      setOrder(isAsc ? "desc" : "asc")
      setOrderBy(property as SortableKeys)
    },
    [orderBy, order]
  )

  const handleRelativeTime = useCallback((_event: MouseEvent<unknown>) => {
    setRelativeTime((prev) => !prev)
  }, [])

  const handleChangePage = useCallback(
    (_event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage)
    },
    []
  )

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0

  const visibleRows = useMemo(
    () =>
      rows
        .slice()
        .sort(getComparator<SortableKeys>(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, order, orderBy, page, rowsPerPage]
  )

  return (
    <>
      <Paper
        variant="outlined"
        sx={{ marginX: { lg: -2 }, overflowX: { lg: "unset", xs: "auto" }, paddingY: 0.5 }}
      >
        <TableContainer sx={{ overflowX: "unset" }}>
          <Table sx={{ minWidth: 750 }} size="small">
            <TableHead
              order={order}
              orderBy={orderBy}
              onSort={handleSort}
              // onRequestSort={handleRequestSort}
              onRelativeTime={handleRelativeTime}
              relativeTime={relativeTime}
            />
            <TableBody>
              {visibleRows.map((x) => (
                <AuditLogTableRow
                  hover
                  onClick={console.log}
                  relativeTime={relativeTime}
                  key={x._id}
                  auditLog={x}
                  assetMap={assetMap}
                  integrationMap={integrationMap}
                />
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 37 * emptyRows }}>
                  <TableCell colSpan={HEAD_CELLS.length} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          sx={{
            background: "var(--mui-palette-background-paper)",
            bottom: 0,
            position: "sticky",
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton
          showLastButton
        />
      </Paper>
    </>
  )
}
