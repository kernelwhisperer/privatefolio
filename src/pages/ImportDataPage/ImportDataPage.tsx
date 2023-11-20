import { FolderOutlined } from "@mui/icons-material"
import { Skeleton, Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { findExchanges } from "../../api/exchanges-api"
import { FileImport, getFileImports, subscribeToFileImports } from "../../api/file-import-api"
import { FileDrop } from "../../components/FileDrop"
import { Exchange } from "../../interfaces"
import { SerifFont } from "../../theme"
import { FileImportsTable } from "./FileImportsTable"

export function ImportDataPage() {
  const [rows, setRows] = useState<FileImport[] | null>(null)
  const [integrationMap, setIntegrationMap] = useState<Record<string, Exchange>>({})
  console.log("📜 LOG > ImportDataPage > rows:", rows)

  useEffect(() => {
    getFileImports()
      .then((rows) => {
        setRows(rows)

        const integrationMap = {}
        rows.forEach((x) => {
          if (x.integration) {
            integrationMap[x.integration] = true
          }
        })

        return findExchanges(integrationMap)
      })
      .then((integrations) => {
        setIntegrationMap(integrations)
      })
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
      {rows === null ? (
        <Stack gap={1.5}>
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
      ) : rows.length === 0 ? (
        <FileDrop sx={{ marginX: -2, padding: 4 }}>
          <Stack alignItems="center">
            <FolderOutlined sx={{ height: 64, width: 64 }} />
            <span>Nothing to see here...</span>
          </Stack>
        </FileDrop>
      ) : (
        <>
          <FileImportsTable rows={rows} integrationMap={integrationMap} />
          <FileDrop sx={{ background: "var(--mui-palette-background-default)", marginX: -2 }} />
        </>
      )}
    </Stack>
  )
}
