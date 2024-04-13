import { DataArrayRounded } from "@mui/icons-material"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import { proxy } from "comlink"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Timestamp } from "src/interfaces"
import { $accountReset, $activeAccount, $activeIndex } from "src/stores/account-store"
import { clancy } from "src/workers/remotes"

export function NoDataButton() {
  const activeIndex = useStore($activeIndex)
  const accountReset = useStore($accountReset)
  const [lastTx, setLastTx] = useState<Timestamp | null>(null)

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

  const dataAvailable = lastTx !== null && lastTx !== 0

  if (dataAvailable) {
    return (
      <Typography color="text.secondary" variant="body2" component="div">
        <span>No records match the current filters.</span>
      </Typography>
    )
  }

  return (
    <Button sx={{ padding: 4 }} component={Link} to={`/u/${activeIndex}/import-data`}>
      <Typography color="text.secondary" variant="body2" component="div">
        <Stack alignItems="center">
          <DataArrayRounded sx={{ height: 64, width: 64 }} />
          <span>No records could be found...</span>
          <Box sx={{ marginTop: 2 }}>
            Visit <u>Import data</u> to get started.
          </Box>
        </Stack>
      </Typography>
    </Button>
  )
}
