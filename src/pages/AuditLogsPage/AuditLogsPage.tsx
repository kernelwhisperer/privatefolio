import { Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { findAssets } from "../../api/assets-api"
import { getAuditLogs } from "../../api/audit-logs-api"
import { findExchanges } from "../../api/exchanges-api"
import { Asset, AuditLog, Exchange } from "../../interfaces"
import { SerifFont } from "../../theme"
import { AuditLogsTable } from "./AuditLogTable"

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditLog[]>([])
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({})
  const [integrationMap, setIntegrationMap] = useState<Record<string, Exchange>>({})

  useEffect(() => {
    getAuditLogs().then(async (auditLogs) => {
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
    <Stack gap={2}>
      <Typography variant="h6" fontFamily={SerifFont}>
        Audit logs
      </Typography>
      <AuditLogsTable rows={rows} assetMap={assetMap} integrationMap={integrationMap} />
    </Stack>
  )
}
