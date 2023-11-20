import { Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { findAssets } from "../../api/assets-api"
import { AuditLog, getAuditLogs } from "../../api/audit-logs-api"
import { findExchanges } from "../../api/exchanges-api"
import { Asset, Exchange } from "../../interfaces"
import { SerifFont } from "../../theme"
import { AuditLogsTable } from "./AuditLogTable"

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditLog[]>([])
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({})
  const [integrationMap, setIntegrationMap] = useState<Record<string, Exchange>>({})

  useEffect(() => {
    getAuditLogs().then(async (auditLogs) => {
      console.log("📜 LOG > getAuditLogs > auditLogs:", auditLogs)
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
      <AuditLogsTable rows={rows} assetMap={assetMap} integrationMap={integrationMap} />
    </Stack>
  )
}
