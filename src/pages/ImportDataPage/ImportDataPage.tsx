import { FolderOutlined } from "@mui/icons-material"
import { Stack, Typography } from "@mui/material"
import React, { useEffect, useMemo, useState } from "react"

import { getFileImports, subscribeToFileImports } from "../../api/file-import-api"
import { MemoryTable } from "../../components/EnhancedTable/MemoryTable"
import { FileDrop } from "../../components/FileDrop"
import { StaggeredList } from "../../components/StaggeredList"
import { FileImport } from "../../interfaces"
import { SerifFont } from "../../theme"
import { HeadCell } from "../../utils/table-utils"
import { FileImportTableRow } from "./FileImportTableRow"

export function ImportDataPage({ show }: { show: boolean }) {
  const [rows, setRows] = useState<FileImport[]>([])

  useEffect(() => {
    async function fetchData() {
      const start = Date.now()
      const rows = await getFileImports()
      console.log(`Query took ${Date.now() - start}ms (file imports)`)
      setRows(rows)
    }

    fetchData().then()

    const unsubscribe = subscribeToFileImports(async () => {
      await fetchData()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const headCells: HeadCell<FileImport>[] = useMemo(
    () => [
      {
        key: "timestamp",
        label: "Imported",
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

  return (
    <StaggeredList
      // component="main"
      gap={1}
      show={show}
    >
      <Typography variant="h6" fontFamily={SerifFont}>
        File imports
      </Typography>
      {rows.length === 0 ? (
        <FileDrop sx={{ marginX: -2, padding: 4 }}>
          <Stack alignItems="center">
            <FolderOutlined sx={{ height: 64, width: 64 }} />
            <span>Nothing to see here...</span>
          </Stack>
        </FileDrop>
      ) : (
        <StaggeredList gap={1} show={show}>
          <MemoryTable<FileImport>
            initOrderBy="timestamp"
            headCells={headCells}
            TableRowComponent={FileImportTableRow}
            rows={rows}
            //
          />
          <FileDrop
            defaultBg="var(--mui-palette-background-default)"
            sx={{
              marginX: -2,
            }}
          />
        </StaggeredList>
      )}
    </StaggeredList>
  )
}
