import { DataArrayRounded } from "@mui/icons-material"
import { Link as MuiLink, Paper, Skeleton, Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { findAssets } from "../../api/assets-api"
import { AuditLog, getAuditLogs } from "../../api/audit-logs-api"
import { findExchanges } from "../../api/exchanges-api"
import { Asset, Exchange } from "../../interfaces"
import { SerifFont } from "../../theme"
import { AuditLogsTable } from "./AuditLogTable"

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditLog[] | null>(null)
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({})
  const [integrationMap, setIntegrationMap] = useState<Record<string, Exchange>>({})

  useEffect(() => {
    const start = Date.now()
    getAuditLogs().then(async (auditLogs) => {
      console.log(`Query took ${Date.now() - start}ms (audit logs)`)
      setRows(auditLogs)

      const symbolMap = {}
      const integrationMap = {}
      auditLogs.forEach((x) => {
        symbolMap[x.symbol] = true
        integrationMap[x.integration] = true
      })

      const assets = await findAssets(symbolMap)
      setAssetMap(assets)

      const integrations = await findExchanges(integrationMap)
      setIntegrationMap(integrations)
    })
  }, [])

  return (
    <Stack gap={1}>
      <Typography variant="h6" fontFamily={SerifFont}>
        <span>Audit logs</span>
        {/* <Stack direction="row" alignItems={"baseline"}>
          <Chip
            component={"span"}
            size="small"
            label={
              <Typography variant="h6" fontFamily={SerifFont}>
                {rows.length}
              </Typography>
            }
            sx={{
              // background: alpha(color, 0.075),
              // color: "text.secondary",
              fontFamily: "inherit",

              fontSize: 14,
              fontWeight: 300,
              marginLeft: 1,
              // letterSpacing: 0.5,
            }}
          />
        </Stack> */}
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
        <Paper sx={{ marginX: -2, padding: 4 }}>
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
        <AuditLogsTable rows={rows} assetMap={assetMap} integrationMap={integrationMap} />
      )}
    </Stack>
  )
}
