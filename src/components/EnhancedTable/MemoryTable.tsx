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
  useMemo,
  useState,
} from "react"

import { TableFooter } from "../../components/TableFooter"
import { FILTER_LABEL_MAP } from "../../stores/metadata-store"
import { stringToColor } from "../../utils/color-utils"
import {
  ActiveFilterMap,
  BaseType,
  HeadCell,
  Order,
  TableRowComponentProps,
  ValueSelector,
} from "../../utils/table-utils"
import { SPRING_CONFIGS } from "../../utils/utils"
import { FilterChip } from "../FilterChip"
import { ConnectedTableHead } from "./ConnectedTableHead"
import { TableSkeleton } from "./TableSkeleton"

function descendingComparator<T extends BaseType>(a: T, b: T, valueSelector: ValueSelector<T>) {
  const valueA = valueSelector(a)
  const valueB = valueSelector(b)

  if (valueA === undefined && valueB === undefined) {
    return 0
  } else if (valueA === undefined) {
    return 1
  } else if (valueB === undefined) {
    return -1
  }

  if (valueB < valueA) {
    return -1
  }
  if (valueB > valueA) {
    return 1
  }

  return 0
}

export function getComparator<T extends BaseType>(
  order: Order,
  valueSelector: ValueSelector<T>
): (a: T, b: T) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, valueSelector)
    : (a, b) => -descendingComparator(a, b, valueSelector)
}

export type MemoryTableProps<T extends BaseType> = {
  TableRowComponent: ComponentType<TableRowComponentProps<T>>
  /**
   * @default 20
   */
  defaultRowsPerPage?: number
  headCells: HeadCell<T>[]
  initOrderBy: keyof T
  queryTime?: number | null
  rows: T[]
}

export function MemoryTable<T extends BaseType>(props: MemoryTableProps<T>) {
  const {
    headCells,
    rows,
    TableRowComponent,
    defaultRowsPerPage = 20,
    initOrderBy,
    queryTime,
  } = props

  const [order, setOrder] = useState<Order>("desc")
  const [orderBy, setOrderBy] = useState<keyof T>(initOrderBy)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage)

  const handleSort = useCallback(
    (_event: MouseEvent<unknown>, property: keyof T) => {
      const isAsc = orderBy === property && order === "asc"
      setOrder(isAsc ? "desc" : "asc")
      setOrderBy(property)
    },
    [orderBy, order]
  )

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

  const valueSelectors = useMemo(
    () =>
      headCells.reduce((acc, headCell) => {
        if (!headCell.key) return acc

        const valueSelector =
          headCell.valueSelector ||
          ((row: T) => row[headCell.key as keyof T] as string | number | undefined)

        return { ...acc, [headCell.key]: valueSelector }
      }, {} as Record<keyof T, ValueSelector<T>>),
    [headCells]
  )

  const visibleRows = useMemo(
    () =>
      rows
        .filter((row) => {
          for (const key in activeFilters) {
            if (valueSelectors[key](row) !== activeFilters[key]) {
              return false
            }
          }
          return true
        })
        .sort(getComparator<T>(order, valueSelectors[orderBy]))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, order, orderBy, page, rowsPerPage, valueSelectors, activeFilters]
  )

  const [relativeTime, setRelativeTime] = useState(false)

  const handleRelativeTime = useCallback((_event: MouseEvent<unknown>) => {
    setRelativeTime((prev) => !prev)
  }, [])

  const transitions = useTransition(queryTime === null, {
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
          ) : (
            <Stack gap={1}>
              {Object.keys(activeFilters).length > 0 && (
                <Stack direction="row" spacing={1} marginLeft={1}>
                  {Object.keys(activeFilters).map((x) => (
                    <FilterChip
                      key={x}
                      label={`${FILTER_LABEL_MAP[x]} = ${activeFilters[x]}`}
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
                  <Table sx={{ minWidth: 750 }} size="small">
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
                      {visibleRows.map((row) => (
                        <TableRowComponent
                          key={row._id}
                          headCells={headCells}
                          relativeTime={relativeTime}
                          row={row}
                        />
                      ))}
                      {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                          {/* TODO */}
                          <TableCell colSpan={headCells.length} />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TableFooter
                  page={page}
                  queryTime={queryTime}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                />
              </Paper>
            </Stack>
          )}
        </a.div>
      ))}
    </>
  )
}
