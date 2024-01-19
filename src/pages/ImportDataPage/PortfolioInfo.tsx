import { Paper, Skeleton, Stack, Typography, TypographyProps } from "@mui/material"
import { useStore } from "@nanostores/react"
import { proxy } from "comlink"
import React, { useEffect, useState } from "react"
import { $accountReset, $activeAccount } from "src/stores/account-store"

import { Timestamp } from "../../interfaces"
import { $filterOptionsMap } from "../../stores/metadata-store"
import { MonoFont } from "../../theme"
import { formatDate, formatNumber } from "../../utils/formatting-utils"
import { clancy } from "../../workers/remotes"

function SectionTitle(props: TypographyProps) {
  return <Typography variant="body2" {...props} />
}

export function PortfolioInfo() {
  const [genesis, setGenesis] = useState<Timestamp | null>(null)
  const [lastTx, setLastTx] = useState<Timestamp | null>(null)

  const accountReset = useStore($accountReset)

  useEffect(() => {
    function fetchData() {
      clancy.getValue<Timestamp>("genesis", 0, $activeAccount.get()).then(setGenesis)
    }

    fetchData()

    const unsubscribePromise = clancy.subscribeToKV(
      "genesis",
      proxy(fetchData),
      $activeAccount.get()
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [accountReset])

  useEffect(() => {
    function fetchData() {
      clancy.getValue<Timestamp>("lastTx", 0, $activeAccount.get()).then(setLastTx)
    }

    fetchData()

    const unsubscribePromise = clancy.subscribeToKV(
      "lastTx",
      proxy(fetchData),
      $activeAccount.get()
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [accountReset])

  const filterMap = useStore($filterOptionsMap)

  return (
    <Paper sx={{ minWidth: 340 }}>
      <Stack sx={{ paddingX: 2, paddingY: 1 }} gap={1}>
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
        <Stack direction="row" justifyContent="space-between">
          <SectionTitle>Last transaction</SectionTitle>
          {lastTx === null ? (
            <Skeleton height={20} width={80}></Skeleton>
          ) : (
            <Typography fontFamily={MonoFont} variant="body2">
              {lastTx === 0 ? (
                <Typography color="text.secondary" component="span" variant="inherit">
                  Unknown
                </Typography>
              ) : (
                <span>{formatDate(lastTx)}</span>
              )}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}
