import { Stack } from "@mui/material"
import { useStore } from "@nanostores/react"
import { proxy } from "comlink"
import React, { useEffect, useMemo, useState } from "react"
import { MemoryTable } from "src/components/EnhancedTable/MemoryTable"
import { FileDrop } from "src/components/FileDrop"
import { FileImport } from "src/interfaces"
import { $accountReset, $activeAccount } from "src/stores/account-store"
import { HeadCell } from "src/utils/table-utils"
import { clancy } from "src/workers/remotes"

import { FileImportHelp } from "./FileImportHelp"
import { FileImportTableRow } from "./FileImportTableRow"

export function FileImportsTable() {
  const [queryTime, setQueryTime] = useState<number | null>(null)
  const [rows, setRows] = useState<FileImport[]>([])

  const accountReset = useStore($accountReset)

  useEffect(() => {
    async function fetchData() {
      const start = Date.now()
      const rows = await clancy.getFileImports($activeAccount.get())
      setQueryTime(Date.now() - start)
      setRows(rows)
    }

    fetchData().then()

    const unsubscribePromise = clancy.subscribeToFileImports(
      proxy(async () => {
        await fetchData()
      }),
      $activeAccount.get()
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [accountReset])

  const headCells: HeadCell<FileImport>[] = useMemo(
    () => [
      {
        key: "timestamp",
        label: "Imported",
        sortable: true,
        sx: { maxWidth: 200, minWidth: 200, width: 200 },
        valueSelector: (row) => row.timestamp || Infinity,
      },
      {
        filterable: true,
        key: "platform" as keyof FileImport,
        label: "",
        sx: { maxWidth: 0, minWidth: 0, width: 0 },
        valueSelector: (row) => row.meta?.platform,
      },
      {
        key: "name",
        label: "Name",
        sortable: true,
        sx: { maxWidth: 360, minWidth: 140, width: "100%" },
      },
      {
        key: "size",
        label: "File size",
        numeric: true,
        sortable: true,
        sx: { maxWidth: 120, minWidth: 120, width: 120 },
      },
      {
        key: "lastModified",
        label: "Last modified",
        sortable: true,
        sx: { maxWidth: 200, minWidth: 200, width: 200 },
      },
      {
        key: "logs" as keyof FileImport,
        label: "Audit logs",
        numeric: true,
        sortable: true,
        sx: { maxWidth: 180, minWidth: 180, width: 180 },
        valueSelector: (row) => row.meta?.logs,
      },
      {
        key: "transactions" as keyof FileImport,
        label: "Transactions",
        numeric: true,
        sortable: true,
        sx: { maxWidth: 180, minWidth: 180, width: 180 },
        valueSelector: (row) => row.meta?.transactions,
      },
      {
        label: "",
        sx: { maxWidth: 44, minWidth: 44, width: 44 },
      },
    ],
    []
  )

  return (
    <Stack gap={1}>
      <MemoryTable<FileImport>
        initOrderBy="timestamp"
        headCells={headCells}
        TableRowComponent={FileImportTableRow}
        rows={rows}
        queryTime={queryTime}
        emptyContent={<FileDrop sx={{ padding: 6 }} size="large" />}
        addNewRow={<FileDrop fullWidth sx={{ borderRadius: 0, paddingX: 1.5 }} />}
      />
      <FileImportHelp />
    </Stack>
  )
}
