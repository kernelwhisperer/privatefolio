import { StorageRounded } from "@mui/icons-material"
import { Paper, Skeleton, Stack, Tooltip, Typography, TypographyProps } from "@mui/material"
import { proxy } from "comlink"
import { debounce } from "lodash-es"
import React, { useEffect, useState } from "react"
import { $activeAccount } from "src/stores/account-store"

import { DEFAULT_DEBOUNCE_DURATION } from "../../settings"
import { MonoFont } from "../../theme"
import { formatFileSize, formatNumber } from "../../utils/formatting-utils"
import { clancy } from "../../workers/remotes"

function SectionTitle(props: TypographyProps) {
  return <Typography variant="body2" {...props} />
}

export function DatabaseInfo() {
  const [storageUsage, setStorageUsage] = useState<number | null>(null)
  const [auditLogs, setAuditLogs] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<number | null>(null)
  // const [genesis, setGenesis] = useState<number | null>(null)

  useEffect(() => {
    function fetchData() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!window.navigator.storage) {
        setStorageUsage(0)
        return
      }

      window.navigator.storage.estimate().then((estimate: any) => {
        setStorageUsage(estimate.usageDetails?.indexedDB ?? null)
      })
    }

    fetchData()

    const interval = setInterval(() => {
      fetchData()
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function fetchData() {
      clancy.countAuditLogs($activeAccount.get()).then(setAuditLogs)
    }

    fetchData()

    const unsubscribePromise = clancy.subscribeToAuditLogs(
      proxy(
        debounce(() => {
          setAuditLogs(null)
          fetchData()
        }, DEFAULT_DEBOUNCE_DURATION)
      ),
      $activeAccount.get()
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [])

  useEffect(() => {
    function fetchData() {
      clancy.countTransactions($activeAccount.get()).then(setTransactions)
    }

    fetchData()

    const unsubscribePromise = clancy.subscribeToTransactions(
      proxy(
        debounce(() => {
          setTransactions(null)
          fetchData()
        }, DEFAULT_DEBOUNCE_DURATION)
      ),
      $activeAccount.get()
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [])

  return (
    <Paper sx={{ minWidth: 340 }}>
      <Stack sx={{ paddingX: 2, paddingY: 1 }} gap={1}>
        <Stack direction="row" justifyContent="space-between">
          <SectionTitle>Disk Usage</SectionTitle>
          {storageUsage === null ? (
            <Skeleton height={20} width={80}></Skeleton>
          ) : storageUsage === 0 ? (
            <Typography color="text.secondary" component="span" variant="body2">
              Unknown
            </Typography>
          ) : (
            <Tooltip
              title={
                <Stack>
                  <span>{formatFileSize(storageUsage, true)}</span>
                  <i className="secondary">
                    <span>{formatNumber(storageUsage)} Bytes</span>
                  </i>
                </Stack>
              }
            >
              <Stack direction="row" gap={1}>
                <StorageRounded fontSize="small" />
                <Typography fontFamily={MonoFont} variant="body2">
                  <span>{formatFileSize(storageUsage)}</span>
                </Typography>
              </Stack>
            </Tooltip>
          )}
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
      </Stack>
    </Paper>
  )
}
