import { CloudOutlined } from "@mui/icons-material"
import { Paper, Stack, Typography } from "@mui/material"
import { proxy } from "comlink"
import React, { useEffect, useMemo, useState } from "react"

import { MemoryTable } from "../../components/EnhancedTable/MemoryTable"
import { useBoolean } from "../../hooks/useBoolean"
import { FileImport } from "../../interfaces"
import { HeadCell } from "../../utils/table-utils"
import { clancy } from "../../workers/remotes"
import { ConnectionDrawer } from "./ConnectionDrawer"
import { FileImportTableRow } from "./FileImportTableRow"

export function ConnectionsTable() {
  const [queryTime, setQueryTime] = useState<number | null>(null)
  const [rows, setRows] = useState<FileImport[]>([])

  useEffect(() => {
    async function fetchData() {
      const start = Date.now()
      // const rows = await clancy.getFileImports()
      setQueryTime(Date.now() - start)
      setRows([])
    }

    fetchData().then()

    const unsubscribePromise = clancy.subscribeToFileImports(
      proxy(async () => {
        await fetchData()
      })
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [])

  const headCells: HeadCell<FileImport>[] = useMemo(
    () => [
      {
        key: "timestamp",
        label: "Last sync",
        sortable: true,
      },
      {
        key: "name",
        label: "Name",
        sortable: true,
      },
      {
        key: "size",
        label: "File size",
        numeric: true,
        sortable: true,
      },
      {
        key: "lastModified",
        label: "Last modified",
        sortable: true,
      },
      {
        filterable: true,
        key: "integration" as keyof FileImport,
        label: "Integration",
        sortable: true,
        valueSelector: (row) => row.meta?.integration,
      },
      {
        key: "logs" as keyof FileImport,
        label: "Audit logs",
        numeric: true,
        sortable: true,
        valueSelector: (row) => row.meta?.logs,
      },
      {
        key: "transactions" as keyof FileImport,
        label: "Transactions",
        numeric: true,
        sortable: true,
        valueSelector: (row) => row.meta?.transactions,
      },
      {
        label: "",
      },
    ],
    []
  )

  const { value: open, toggle: toggleOpen } = useBoolean(false)

  return (
    <>
      {queryTime !== null && rows.length === 0 ? (
        <Paper
          sx={(theme) => ({
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
            borderStyle: "dashed",
            // borderWidth: 2,
            color: theme.palette.text.primary,
            cursor: "pointer",
            padding: 4,
            // padding: 1,
            textAlign: "center",
            transition: theme.transitions.create("background-color", {
              duration: theme.transitions.duration.shortest,
            }),
          })}
          onClick={toggleOpen}
        >
          <Typography color="text.secondary" variant="body2" component="div">
            <Stack alignItems="center" gap={4}>
              <Stack alignItems="center">
                <CloudOutlined sx={{ height: 64, width: 64 }} />
                <span>Nothing to see here...</span>
              </Stack>
              <span>Click this card get started with adding a new connection.</span>
            </Stack>
          </Typography>
        </Paper>
      ) : (
        <MemoryTable<FileImport>
          initOrderBy="timestamp"
          headCells={headCells}
          TableRowComponent={FileImportTableRow}
          rows={rows}
          queryTime={queryTime}
          //
        />
      )}
      <ConnectionDrawer open={open} toggleOpen={toggleOpen} />
    </>
  )
}
