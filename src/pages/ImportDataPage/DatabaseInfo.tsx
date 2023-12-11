import { StorageRounded } from "@mui/icons-material"
import { Paper, Skeleton, Stack, Tooltip, Typography, TypographyProps } from "@mui/material"
import { grey } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
import React, { useEffect, useState } from "react"

import { findAuditLogs } from "../../api/audit-logs-api"
import { auditLogsDB, transactionsDB } from "../../api/database"
import { $filterOptionsMap } from "../../stores/metadata-store"
import { MonoFont } from "../../theme"
import { formatDate, formatFileSize, formatNumber } from "../../utils/client-utils"

export function SectionTitle(props: TypographyProps) {
  return <Typography variant="body2" {...props} />
}

export function DatabaseInfo() {
  const [storageUsage, setStorageUsage] = useState<number | null>(null)
  const [auditLogs, setAuditLogs] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<number | null>(null)
  const [genesis, setGenesis] = useState<number | null>(null)

  useEffect(() => {
    window.navigator.storage.estimate().then((estimate: any) => {
      setStorageUsage(estimate.usageDetails?.indexedDB ?? null)
    })
  }, [])

  useEffect(() => {
    auditLogsDB.allDocs({ include_docs: false, limit: 1 }).then((res) => {
      setAuditLogs(res.total_rows)
    })
  }, [])

  useEffect(() => {
    transactionsDB.allDocs({ include_docs: false, limit: 1 }).then((res) => {
      setTransactions(res.total_rows)
    })
  }, [])

  useEffect(() => {
    findAuditLogs({ limit: 1, order: "asc" }).then((res) => {
      setGenesis(res?.[0].timestamp)
    })
  }, [])

  const filterMap = useStore($filterOptionsMap)

  return (
    <Paper sx={{ width: 360 }}>
      <Stack sx={{ paddingX: 2, paddingY: 1 }} gap={1}>
        <Stack direction="row" justifyContent="space-between">
          <SectionTitle>Disk Usage</SectionTitle>
          <Stack direction="row" gap={1}>
            <StorageRounded fontSize="small" />
            {storageUsage === null ? (
              <Skeleton height={20} width={80}></Skeleton>
            ) : (
              <Tooltip
                title={
                  <Stack>
                    <span>{formatFileSize(storageUsage, true)}</span>
                    <Typography color={grey[400]} component="i" variant="inherit">
                      <span>{formatNumber(storageUsage)} Bytes</span>
                    </Typography>
                  </Stack>
                }
              >
                <Typography fontFamily={MonoFont} variant="body2">
                  <span>{formatFileSize(storageUsage)}</span>
                </Typography>
              </Tooltip>
            )}
          </Stack>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <SectionTitle>Audit logs</SectionTitle>
          {auditLogs === null ? (
            <Skeleton height={20} width={80}></Skeleton>
          ) : (
            <Typography fontFamily={MonoFont} variant="body2">
              <span>{formatNumber(auditLogs)}</span>
            </Typography>
          )}
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <SectionTitle>Transactions</SectionTitle>
          {transactions === null ? (
            <Skeleton height={20} width={80}></Skeleton>
          ) : (
            <Typography fontFamily={MonoFont} variant="body2">
              <span>{formatNumber(transactions)}</span>
            </Typography>
          )}
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <SectionTitle>Unique assets</SectionTitle>
          {!filterMap.symbol?.length ? (
            <Skeleton height={20} width={80}></Skeleton>
          ) : (
            <Typography fontFamily={MonoFont} variant="body2">
              <span>{formatNumber(filterMap.symbol.length)}</span>
            </Typography>
          )}
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <SectionTitle>Portfolio genesis</SectionTitle>
          {genesis === null ? (
            <Skeleton height={20} width={80}></Skeleton>
          ) : (
            <Typography fontFamily={MonoFont} variant="body2">
              <span>{formatDate(genesis)}</span>
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}
