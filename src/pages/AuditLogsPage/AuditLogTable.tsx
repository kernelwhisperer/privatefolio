import { DataArrayRounded, TimerSharp } from "@mui/icons-material"
import {
  CircularProgress,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import MuiTableHead from "@mui/material/TableHead"
import TablePagination, { tablePaginationClasses } from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import { useStore } from "@nanostores/react"
import { a, useTransition } from "@react-spring/web"
import React, { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { findAuditLogs } from "../../api/audit-logs-api"
import { FilterChip } from "../../components/FilterChip"
import { TablePaginationActions } from "../../components/TableActions"
import { AuditLog } from "../../interfaces"
import { $activeFilters, ActiveFilterMap } from "../../stores/audit-log-store"
import { FilterKey, FILTER_LABEL_MAP } from "../../stores/metadata-store"
import { MonoFont } from "../../theme"
import { formatNumber } from "../../utils/client-utils"
import { stringToColor } from "../../utils/color-utils"
import { Order } from "../../utils/table-utils"
import { SPRING_CONFIGS } from "../../utils/utils"
import { AuditLogTableHead } from "./AuditLogTableHead"
import { AuditLogTableRow } from "./AuditLogTableRow"

type SortableKey = keyof AuditLog

interface HeadCell {
  filterable?: boolean
  key: SortableKey
  label: string
  numeric?: boolean
  sortable?: boolean
}

interface AuditLogsTableProps {
  symbol?: string
}

export function AuditLogsTable(props: AuditLogsTableProps) {
  const { symbol } = props

  const [queryTime, setQueryTime] = useState<number | null>(null)
  const [rowCount, setRowCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [rows, setRows] = useState<AuditLog[]>([])
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState<Order>("desc")
  const [orderBy, setOrderBy] = useState<SortableKey>("timestamp") // THIS IS A CONST NOW
  const [rowsPerPage, setRowsPerPage] = useState(symbol ? 10 : 25)

  const [relativeTime, setRelativeTime] = useState(true)

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
  const emptyRows = page > 0 ? Math.max(0, rowsPerPage - rows.length) : 0
  // TODO

  const handleSort = useCallback(
    (_event: MouseEvent<unknown>, property: SortableKey) => {
      const isAsc = orderBy === property && order === "asc"
      setOrder(isAsc ? "desc" : "asc")
      setOrderBy(property as SortableKey)
    },
    [orderBy, order]
  )

  const activeFilters = useStore($activeFilters)

  const queryRows = useCallback(
    async (filters: ActiveFilterMap, rowsPerPage: number, page: number, order: Order) => {
      setQueryTime(null)
      const start = Date.now()

      const auditLogs = await findAuditLogs({
        filters,
        limit: rowsPerPage,
        order,
        skip: page * rowsPerPage,
      })
      console.log("📜 LOG > AuditLogsTable > auditLogs:", auditLogs)

      console.log(`Query took ${Date.now() - start}ms (audit logs)`)
      setRows(auditLogs)
      setLoading(false)
      setQueryTime(Date.now() - start)

      const count = await findAuditLogs({
        fields: [],
        filters,
      })
      setRowCount(count.length)
    },
    []
  )

  useEffect(() => {
    queryRows({ symbol, ...activeFilters }, rowsPerPage, page, order).then()
  }, [symbol, queryRows, activeFilters, rowsPerPage, page, order])

  const headCells = useMemo<HeadCell[]>(
    () => [
      {
        key: "timestamp",
        label: "Timestamp",
        sortable: true,
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
      ...(!symbol
        ? ([
            {
              filterable: true,
              key: "symbol",
              label: "Asset",
            },
          ] as HeadCell[])
        : []),
      {
        key: "balance",
        label: "New balance",
        numeric: true,
      },
    ],
    [symbol]
  )

  const transitions = useTransition(loading, {
    config: SPRING_CONFIGS.veryQuick,
    enter: { opacity: 2 },
    exitBeforeEnter: true,
    from: { opacity: 2 },
    leave: { opacity: 1 },
  })

  return (
    <>
      {transitions((styles, isLoading) => (
        <a.div style={styles}>
          {isLoading ? (
            <Stack gap={1.5} sx={{ marginX: { lg: -2 } }}>
              <Stack direction="row" gap={1.5}>
                <Skeleton variant="rounded" height={56} width={240}></Skeleton>
                <Skeleton variant="rounded" height={56} width={240}></Skeleton>
                <Skeleton variant="rounded" height={56} width={240}></Skeleton>
              </Stack>
              <Skeleton variant="rounded" height={37}></Skeleton>
              <Skeleton variant="rounded" height={37}></Skeleton>
              <Skeleton variant="rounded" height={37}></Skeleton>
              <Skeleton variant="rounded" height={37}></Skeleton>
            </Stack>
          ) : rows.length === 0 && Object.keys(activeFilters).length === 0 ? (
            <Paper sx={{ marginX: { lg: -2 }, padding: 4 }}>
              <Typography color="text.secondary" variant="body2" component="div">
                <Stack alignItems="center">
                  <DataArrayRounded sx={{ height: 64, width: 64 }} />
                  <span>Nothing to see here...</span>
                  <MuiLink
                    color="inherit"
                    sx={{ marginTop: 4 }}
                    component={Link}
                    to="/import-data"
                    underline="hover"
                  >
                    Visit <i>Import data</i> to get started
                  </MuiLink>
                </Stack>
              </Typography>
            </Paper>
          ) : (
            <Stack gap={1}>
              {Object.keys(activeFilters).length > 0 && (
                <Stack direction="row" spacing={1} marginLeft={0}>
                  {Object.keys(activeFilters).map((x) => (
                    <FilterChip
                      key={x}
                      label={`${FILTER_LABEL_MAP[x]} = ${activeFilters[x]}`}
                      color={stringToColor(x)}
                      onDelete={() => {
                        $activeFilters.setKey(x as FilterKey, undefined)
                      }}
                    />
                  ))}
                </Stack>
              )}
              <Paper
                variant="outlined"
                sx={{ marginX: { lg: -2 }, overflowX: { lg: "unset", xs: "auto" }, paddingY: 0.5 }}
              >
                <TableContainer sx={{ overflowX: "unset" }}>
                  <Table sx={{ minWidth: 750 }} size="small">
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
                        {headCells.map((headCell, index) => (
                          <TableCell
                            key={index}
                            padding="normal"
                            sortDirection={orderBy === headCell.key ? order : false}
                          >
                            <AuditLogTableHead
                              headCell={headCell}
                              order={order}
                              orderBy={orderBy}
                              onSort={handleSort}
                              // onRequestSort={handleRequestSort}
                              onRelativeTime={handleRelativeTime}
                              relativeTime={relativeTime}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    </MuiTableHead>
                    <TableBody>
                      {rows.map((x) => (
                        <AuditLogTableRow
                          hover
                          onClick={console.log}
                          relativeTime={relativeTime}
                          key={x._id}
                          auditLog={x}
                          symbol={symbol}
                        />
                      ))}
                      {emptyRows > 0 && (
                        <TableRow style={{ height: 37 * emptyRows }}>
                          <TableCell colSpan={headCells.length} />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack
                  direction="row"
                  sx={{
                    background: "var(--mui-palette-background-paper)",
                    bottom: 0,
                    position: "sticky",
                  }}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Tooltip
                    title={null}
                    // title={
                    //   queryTime ? (
                    //     <Stack>
                    //       <span>Fetch query time: 0.1s</span>
                    //       <span>Count query time: 0.1s</span>
                    //       <Typography color={grey[400]} component="i" variant="inherit">
                    //         these operations can take a long time because they are read from the
                    //         disk
                    //       </Typography>
                    //     </Stack>
                    //   ) : null
                    // }
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component={Stack}
                      padding={1.5}
                      sx={{ minWidth: 100 }}
                      fontFamily={MonoFont}
                      direction="row"
                      gap={1}
                      marginBottom={0.25}
                    >
                      {queryTime === null ? (
                        <CircularProgress size={14} color="inherit" sx={{ margin: "3px" }} />
                      ) : (
                        <TimerSharp fontSize="small" />
                      )}
                      {queryTime === null ? (
                        <Skeleton sx={{ flexGrow: 1 }}></Skeleton>
                      ) : (
                        <span>
                          {formatNumber(queryTime / 1000, {
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          })}
                          s
                        </span>
                      )}
                    </Typography>
                  </Tooltip>
                  <TablePagination
                    component="div"
                    sx={{
                      border: 0,
                      width: "100%",
                      [`& .${tablePaginationClasses.spacer}`]: {
                        flexBasis: 0,
                        flexGrow: 0,
                      },
                      [`& .${tablePaginationClasses.input}`]: {
                        marginRight: "auto",
                      },
                      [`& .${tablePaginationClasses.toolbar}`]: {
                        paddingLeft: 0,
                      },
                      [`& .${tablePaginationClasses.select}, & .${tablePaginationClasses.selectIcon}`]:
                        {
                          color: "var(--mui-palette-text-secondary)",
                        },
                      [`& .${tablePaginationClasses.select}`]: {
                        borderRadius: 1,
                      },
                      [`& .${tablePaginationClasses.select}:hover`]: {
                        background: "rgba(var(--mui-palette-common-onBackgroundChannel) / 0.05)",
                      },
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    count={rowCount ?? 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
                    labelDisplayedRows={({ from, to, count }) => (
                      <>
                        {from}-{to}{" "}
                        <Typography variant="body2" component="span" color="text.secondary">
                          of {count}
                        </Typography>
                      </>
                    )}
                    slotProps={{
                      select: {
                        renderValue: (value) => `${value} rows per page`,
                      },
                    }}
                    ActionsComponent={TablePaginationActions}
                  />
                </Stack>
              </Paper>
            </Stack>
          )}
        </a.div>
      ))}
    </>
  )
}
