import { StorageRounded } from "@mui/icons-material"
import { Paper, Skeleton, Stack, Tooltip, Typography, TypographyProps } from "@mui/material"
import { grey } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
import React, { useEffect, useState } from "react"

import { $filterOptionsMap } from "../../stores/metadata-store"
import { MonoFont } from "../../theme"
import { formatDate, formatFileSize, formatNumber } from "../../utils/formatting-utils"
import { clancy } from "../../workers/remotes"

function SectionTitle(props: TypographyProps) {
  return <Typography variant="body2" {...props} />
}

export function DatabaseInfo() {
  const [storageUsage, setStorageUsage] = useState<number | null>(null)
  const [auditLogs, setAuditLogs] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<number | null>(null)
  const [genesis, setGenesis] = useState<number | null>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.navigator.storage.estimate().then((estimate: any) => {
      setStorageUsage(estimate.usageDetails?.indexedDB ?? null)
    })
  }, [])

  useEffect(() => {
    clancy.countAuditLogs().then(setAuditLogs)
  }, [])

  useEffect(() => {
    clancy.countTransactions().then(setTransactions)
  }, [])

  useEffect(() => {
    clancy.findAuditLogs({ limit: 1, order: "asc" }).then((res) => {
      if (res.length === 0) {
        setGenesis(0)
      } else {
        setGenesis(res[0].timestamp)
      }
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
          {filterMap.symbol === undefined ? (
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
              {genesis === 0 ? (
                <Typography color="text.secondary" component="span" variant="inherit">
                  Unknown
                </Typography>
              ) : (
                <span>{formatDate(genesis)}</span>
              )}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}
