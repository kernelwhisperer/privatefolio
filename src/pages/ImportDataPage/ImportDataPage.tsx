import { Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { FileImport, getFileImports, subscribeToFileImports } from "../../api/file-import-api"
import { FileDrop } from "../../components/FileDrop"
import { SerifFont } from "../../theme"
import { FileImportsTable } from "./FileImportsTable"

export function ImportDataPage() {
  const [rows, setRows] = useState<FileImport[]>([])
  console.log("📜 LOG > ImportDataPage > rows:", rows)

  useEffect(() => {
    getFileImports().then(setRows)
    const unsubscribe = subscribeToFileImports(setRows)

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <Stack gap={1}>
      <Typography variant="h6" fontFamily={SerifFont}>
        File imports
      </Typography>
      <FileDrop />
      <FileImportsTable rows={rows} integrationMap={{}} />
    </Stack>
  )
}
