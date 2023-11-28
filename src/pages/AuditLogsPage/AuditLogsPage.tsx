import { DataArrayRounded } from "@mui/icons-material"
import { Link as MuiLink, Paper, Skeleton, Stack, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import { a, useTransition } from "@react-spring/web"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { findAssets } from "../../api/assets-api"
import { getAuditLogs } from "../../api/audit-logs-api"
import { findExchanges } from "../../api/exchanges-api"
import { FilterChip } from "../../components/FilterChip"
import { StaggeredList } from "../../components/StaggeredList"
import { Asset, AuditLog, Exchange } from "../../interfaces"
import {
  $activeFilters,
  computeFilterMap,
  FilterKey,
  LABEL_MAP,
} from "../../stores/audit-log-store"
import { SerifFont } from "../../theme"
import { stringToColor } from "../../utils/color-utils"
import { SPRING_CONFIGS, wait } from "../../utils/utils"
import { AuditLogsTable } from "./AuditLogTable"

export function AuditLogsPage({ show }: { show: boolean }) {
  const [queryTime, setQueryTime] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [rows, setRows] = useState<AuditLog[]>([])
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>({})
  const [integrationMap, setIntegrationMap] = useState<Record<string, Exchange>>({})

  const activeFilters = useStore($activeFilters)

  useEffect(() => {
    computeFilterMap().then()
  }, [])

  useEffect(() => {
    const start = Date.now()
    // TODO make this cancelable
    setQueryTime(null)
    wait(200)
      .then(() => getAuditLogs(activeFilters))
      .then(async (auditLogs) => {
        console.log(`Query took ${Date.now() - start}ms (audit logs)`)
        setRows(auditLogs)
        setLoading(false)
        setQueryTime(Date.now() - start)

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
  }, [activeFilters])

  const transitions = useTransition(loading, {
    config: SPRING_CONFIGS.veryQuick,
    enter: { opacity: 2 },
    exitBeforeEnter: true,
    from: { opacity: 2 },
    leave: { opacity: 1 },
  })

  return (
    <StaggeredList gap={1} show={show}>
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
      {transitions((styles, isLoading) => (
        <a.div style={styles}>
          {isLoading ? (
            <Stack gap={1.5} sx={{ marginX: { lg: -2 } }}>
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
          ) : rows.length === 0 && Object.keys(activeFilters).length === 0 ? (
            <Paper sx={{ marginX: { lg: -2 }, padding: 4 }}>
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
            <Stack gap={1}>
              {Object.keys(activeFilters).length > 0 && (
                <Stack direction="row" spacing={1} marginLeft={0}>
                  {Object.keys(activeFilters).map((x) => (
                    <FilterChip
                      key={x}
                      label={`${LABEL_MAP[x]} = ${activeFilters[x]}`}
                      color={stringToColor(x)}
                      onDelete={() => {
                        $activeFilters.setKey(x as FilterKey, undefined)
                      }}
                    />
                  ))}
                </Stack>
              )}
              <AuditLogsTable
                rows={rows}
                assetMap={assetMap}
                integrationMap={integrationMap}
                queryTime={queryTime}
              />
            </Stack>
          )}
        </a.div>
      ))}
    </StaggeredList>
  )
}
