import { LinearProgress, Paper, Stack, TableHead, useMediaQuery } from "@mui/material"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"
import React, {
  ChangeEvent,
  ComponentType,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useSearchParams } from "react-router-dom"
import { $debugMode } from "src/stores/app-store"
import { wait } from "src/utils/utils"

import { FILTER_LABEL_MAP, getFilterValueLabel } from "../../stores/metadata-store"
import { stringToColor } from "../../utils/color-utils"
import {
  ActiveFilterMap,
  BaseType,
  HeadCell,
  Order,
  TableRowComponentProps,
} from "../../utils/table-utils"
import { CircularSpinner } from "../CircularSpinner"
import { FilterChip } from "../FilterChip"
import { NoDataButton } from "../NoDataButton"
import { TableFooter } from "../TableFooter"
import { ConnectedTableHead } from "./ConnectedTableHead"
export type { ConnectedTableHead } from "./ConnectedTableHead"

export type QueryFunction<T extends BaseType> = (
  filters: ActiveFilterMap<T>,
  rowsPerPage: number,
  page: number,
  order: Order
) => Promise<[T[], number | (() => Promise<number>)]>

export interface RemoteTableProps<T extends BaseType> {
  TableRowComponent: ComponentType<TableRowComponentProps<T>>
  addNewRow?: JSX.Element
  /**
   * @default 20
   */
  defaultRowsPerPage?: number
  emptyContent?: JSX.Element
  headCells: HeadCell<T>[]
  initOrderBy: keyof T
  queryFn: QueryFunction<T>
}

export function RemoteTable<T extends BaseType>(props: RemoteTableProps<T>) {
  const {
    headCells,
    queryFn,
    TableRowComponent,
    defaultRowsPerPage = 20,
    initOrderBy,
    emptyContent = <NoDataButton />,
    addNewRow,
  } = props

  const [queryTime, setQueryTime] = useState<number | null>(null)
  const [rowCount, setRowCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true) // TODO
  const [rows, setRows] = useState<T[]>([])
  const [orderBy, setOrderBy] = useState<keyof T>(initOrderBy)
  const [relativeTime, setRelativeTime] = useState(!$debugMode.get())

  const [searchParams, setSearchParams] = useSearchParams()

  const rowsPerPage = searchParams.get("rowsPerPage")
    ? Number(searchParams.get("rowsPerPage"))
    : defaultRowsPerPage
  const setRowsPerPage = useCallback(
    (rowsPerPage: number) => {
      searchParams.set("rowsPerPage", String(rowsPerPage))
      setSearchParams(searchParams)
    },
    [searchParams, setSearchParams]
  )

  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 0
  const setPage = useCallback(
    (page: number) => {
      searchParams.set("page", String(page))
      setSearchParams(searchParams)
    },
    [searchParams, setSearchParams]
  )

  const order = searchParams.get("order") ? (searchParams.get("order") as Order) : "desc"
  const setOrder = useCallback(
    (order: Order) => {
      searchParams.set("order", order)
      setSearchParams(searchParams)
    },
    [searchParams, setSearchParams]
  )

  const handleRelativeTime = useCallback((_event: MouseEvent<unknown>) => {
    setRelativeTime((prev) => !prev)
  }, [])

  const handleChangePage = useCallback(
    (_event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage)
    },
    [setPage]
  )

  const handleChangeRowsPerPage = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [setPage, setRowsPerPage]
  )

  const handleSort = useCallback(
    (_event: MouseEvent<unknown>, property: keyof T) => {
      const isAsc = orderBy === property && order === "asc"
      setOrder(isAsc ? "desc" : "asc")
      setOrderBy(property)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderBy, order]
  )

  const activeFilters: ActiveFilterMap<T> = useMemo(() => {
    const activeFilters: ActiveFilterMap<T> = {}
    for (const [key, value] of searchParams) {
      if (key === "page" || key === "rowsPerPage" || key === "order") {
        continue
      }
      headCells.forEach((headCell) => {
        if (headCell.filterable && headCell.key === key) {
          activeFilters[key] = value
        }
      })
    }
    return activeFilters
  }, [headCells, searchParams])

  const setFilterKey = useCallback(
    (key: keyof T, value: string | number | undefined) => {
      if (value === undefined) {
        searchParams.delete(String(key))
      } else {
        searchParams.set(String(key), String(value))
      }
      setSearchParams(searchParams)
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    const start = Date.now()

    setLoading(true)
    Promise.all([queryFn(activeFilters, rowsPerPage, page, order), wait(150)]).then(
      ([[rows, queryCount]]) => {
        setLoading(false)
        setRows(rows)
        setQueryTime(Date.now() - start)

        if (typeof queryCount === "function") {
          queryCount().then(setRowCount)
        } else {
          setRowCount(queryCount)
        }
      }
    )
  }, [queryFn, activeFilters, rowsPerPage, page, order])

  const isTablet = useMediaQuery("(max-width: 899px)")
  const isMobile = useMediaQuery("(max-width: 599px)")

  const stickyVersion = true // rowsPerPage > 20

  const isFirstLoading = queryTime === null
  const isEmpty = rows.length === 0 && Object.keys(activeFilters).length === 0

  return (
    <>
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
          elevation={0}
          sx={{
            background: stickyVersion
              ? "var(--mui-palette-background-paper) !important"
              : undefined,
            paddingY: 0,
          }}
        >
          <TableContainer sx={{ overflowX: "unset" }}>
            <Table size="small" stickyHeader={stickyVersion}>
              {isTablet ? null : (
                <TableHead>
                  <TableRow>
                    {headCells.map((headCell, index) => (
                      <TableCell
                        key={index}
                        padding="normal"
                        sortDirection={orderBy === headCell.key ? order : false}
                        sx={{
                          ...headCell.sx,
                          ...(isFirstLoading || isEmpty
                            ? {
                                borderColor: "transparent",
                                opacity: 0,
                                pointerEvents: "none",
                              }
                            : {}),
                        }}
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
                  <TableRow
                    sx={{
                      height: 0,
                      position: "sticky",
                      top: 39,
                    }}
                  >
                    <TableCell colSpan={99} sx={{ border: 0, padding: 0 }}>
                      {loading && !isFirstLoading && (
                        <LinearProgress
                          sx={{
                            background: "transparent",
                            borderRadius: 0,
                            height: 2,
                            position: "absolute",
                            top: 0,
                            width: "100%",
                          }}
                          color="accent"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                </TableHead>
              )}
              <TableBody>
                {rows.map((row) => (
                  <TableRowComponent
                    isTablet={isTablet}
                    isMobile={isMobile}
                    key={row._id}
                    headCells={headCells}
                    relativeTime={relativeTime}
                    row={row}
                  />
                ))}
                {rows.length === 0 && !isEmpty && !loading && (
                  <TableRow>
                    <TableCell colSpan={99}>No records match the current filters.</TableCell>
                  </TableRow>
                )}
                {(isFirstLoading || isEmpty) && (
                  <TableRow>
                    <TableCell colSpan={99}>
                      <Stack justifyContent="center" alignItems="center" sx={{ height: 260 }}>
                        {isEmpty && !isFirstLoading && emptyContent}
                        {isFirstLoading && <CircularSpinner color="secondary" />}
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
                {!isFirstLoading && addNewRow && !isEmpty && (
                  <TableRow>
                    <TableCell colSpan={99} variant="clickable">
                      {addNewRow}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TableFooter
            stickyVersion={stickyVersion}
            queryTime={queryTime}
            count={rowCount ?? -1}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[10, 20, 50, 100]}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              ...(isFirstLoading || isEmpty
                ? {
                    borderColor: "transparent",
                    opacity: 0,
                    pointerEvents: "none",
                  }
                : {}),
            }}
          />
        </Paper>
      </Stack>
    </>
  )
}
