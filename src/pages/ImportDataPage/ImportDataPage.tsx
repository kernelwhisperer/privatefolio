import { FolderOutlined } from "@mui/icons-material"
import { Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { getFileImports, subscribeToFileImports } from "../../api/file-import-api"
import { FileDrop } from "../../components/FileDrop"
import { StaggeredList } from "../../components/StaggeredList"
import { FileImport } from "../../interfaces"
import { SerifFont } from "../../theme"
import { FileImportsTable } from "./FileImportsTable"

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
          <FileImportsTable rows={rows} />
          <FileDrop sx={{ background: "var(--mui-palette-background-default)", marginX: -2 }} />
        </StaggeredList>
      )}
    </StaggeredList>
  )
}
