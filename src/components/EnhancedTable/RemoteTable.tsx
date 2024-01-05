import { Paper, Stack, TableHead } from "@mui/material"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"
import { a, useTransition } from "@react-spring/web"
import React, {
  ChangeEvent,
  ComponentType,
  MouseEvent,
  useCallback,
  useEffect,
  useState,
} from "react"

import { FILTER_LABEL_MAP, getFilterValueLabel } from "../../stores/metadata-store"
import { stringToColor } from "../../utils/color-utils"
import {
  ActiveFilterMap,
  BaseType,
  HeadCell,
  Order,
  TableRowComponentProps,
} from "../../utils/table-utils"
import { SPRING_CONFIGS } from "../../utils/utils"
import { FilterChip } from "../FilterChip"
import { NoDataCard } from "../NoDataCard"
import { TableFooter } from "../TableFooter"
import { ConnectedTableHead } from "./ConnectedTableHead"
import { TableSkeleton } from "./TableSkeleton"
export type { ConnectedTableHead } from "./ConnectedTableHead"

export type QueryFunction<T extends BaseType> = (
  filters: ActiveFilterMap<T>,
  rowsPerPage: number,
  page: number,
  order: Order
) => Promise<[T[], number | (() => Promise<number>)]>

export interface RemoteTableProps<T extends BaseType> {
  TableRowComponent: ComponentType<TableRowComponentProps<T>>
  /**
   * @default 20
   */
  defaultRowsPerPage?: number
  headCells: HeadCell<T>[]
  initOrderBy: keyof T
  queryFn: QueryFunction<T>
}

export function RemoteTable<T extends BaseType>(props: RemoteTableProps<T>) {
  const { headCells, queryFn, TableRowComponent, defaultRowsPerPage = 20, initOrderBy } = props

  const [queryTime, setQueryTime] = useState<number | null>(null)
  const [rowCount, setRowCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [rows, setRows] = useState<T[]>([])
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState<Order>("desc")
  const [orderBy, setOrderBy] = useState<keyof T>(initOrderBy)
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage)

  // TODO turn into setting
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
    (_event: MouseEvent<unknown>, property: keyof T) => {
      const isAsc = orderBy === property && order === "asc"
      setOrder(isAsc ? "desc" : "asc")
      setOrderBy(property)
    },
    [orderBy, order]
  )

  const [activeFilters, setActiveFilters] = useState<ActiveFilterMap<T>>({})

  const setFilterKey = useCallback((key: keyof T, value: string | number | undefined) => {
    setActiveFilters((previous) => {
      const next = { ...previous }

      if (value === undefined) {
        delete next[key]
      } else {
        next[key] = value
      }

      return next
    })
  }, [])

  useEffect(() => {
    setQueryTime(null)
    const start = Date.now()

    queryFn(activeFilters, rowsPerPage, page, order).then(([rows, queryCount]) => {
      setRows(rows)
      setLoading(false)
      setQueryTime(Date.now() - start)

      if (typeof queryCount === "function") {
        queryCount().then(setRowCount)
      } else {
        setRowCount(queryCount)
      }
    })
  }, [queryFn, activeFilters, rowsPerPage, page, order])

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
            <TableSkeleton />
          ) : rows.length === 0 && Object.keys(activeFilters).length === 0 ? (
            <NoDataCard />
          ) : (
            <Stack gap={1}>
              {Object.keys(activeFilters).length > 0 && (
                <Stack direction="row" spacing={1} marginLeft={1} marginTop={0.5}>
                  {Object.keys(activeFilters).map((x) => (
                    <FilterChip
                      key={x}
                      label={`${FILTER_LABEL_MAP[x]} = ${getFilterValueLabel(activeFilters[x])}`}
                      color={stringToColor(x)}
                      onDelete={() => {
                        setFilterKey(x as keyof T, undefined)
                      }}
                    />
                  ))}
                </Stack>
              )}
              <Paper
                variant="outlined"
                sx={{ overflowX: { lg: "unset", xs: "auto" }, paddingY: 0.5 }}
              >
                <TableContainer sx={{ overflowX: "unset" }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {headCells.map((headCell, index) => (
                          <TableCell
                            key={index}
                            padding="normal"
                            sortDirection={orderBy === headCell.key ? order : false}
                          >
                            <ConnectedTableHead<T>
                              activeFilters={activeFilters}
                              setFilterKey={setFilterKey}
                              headCell={headCell}
                              order={order}
                              orderBy={orderBy}
                              onSort={handleSort}
                              onRelativeTime={handleRelativeTime}
                              relativeTime={relativeTime}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRowComponent
                          isTablet={false} // TODO
                          isMobile={false} // TODO
                          key={row._id}
                          headCells={headCells}
                          relativeTime={relativeTime}
                          row={row}
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
                <TableFooter
                  queryTime={queryTime}
                  count={rowCount ?? -1}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            </Stack>
          )}
        </a.div>
      ))}
    </>
  )
}
