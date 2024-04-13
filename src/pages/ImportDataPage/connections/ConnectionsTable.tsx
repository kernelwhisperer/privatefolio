import { Add, CloudOutlined } from "@mui/icons-material"
import { AlertTitle, Box, Button, Stack, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import { proxy } from "comlink"
import React, { useEffect, useMemo, useState } from "react"
import { AttentionBlock } from "src/components/AttentionBlock"
import { Callout } from "src/components/Callout"
import { MemoryTable } from "src/components/EnhancedTable/MemoryTable"
import { useBoolean } from "src/hooks/useBoolean"
import { Connection } from "src/interfaces"
import { $accountReset, $activeAccount } from "src/stores/account-store"
import { HeadCell } from "src/utils/table-utils"
import { clancy } from "src/workers/remotes"

import { ConnectionDrawer } from "./ConnectionDrawer"
import { ConnectionTableRow } from "./ConnectionTableRow"

export function ConnectionsTable() {
  const { value: open, toggle: toggleOpen } = useBoolean(false)
  const [queryTime, setQueryTime] = useState<number | null>(null)
  const [rows, setRows] = useState<Connection[]>([])

  const accountReset = useStore($accountReset)

  useEffect(() => {
    async function fetchData() {
      const start = Date.now()
      const rows = await clancy.getConnections($activeAccount.get())
      setQueryTime(Date.now() - start)
      // console.log("📜 LOG > fetchData > rows:", rows)
      setRows(rows)
    }

    fetchData().then()

    const unsubscribePromise = clancy.subscribeToConnections(
      proxy(async () => {
        await fetchData()
      }),
      $activeAccount.get()
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [accountReset])

  const headCells: HeadCell<Connection>[] = useMemo(
    () => [
      {
        key: "timestamp",
        label: "Created",
        sortable: true,
      },
      {
        key: "syncedAt",
        label: "Synced at",
        sortable: true,
      },
      // {
      //   filterable: true,
      //   hideLabel: true,
      //   key: "platform",
      //   label: "Platform",
      // },
      {
        key: "address",
        label: "Address",
        sortable: true,
      },
      {
        key: "logs" as keyof Connection,
        label: "Audit logs",
        numeric: true,
        sortable: true,
        // valueSelector: (row) => row.meta?.logs,
      },
      {
        key: "transactions" as keyof Connection,
        label: "Transactions",
        numeric: true,
        sortable: true,
        // valueSelector: (row) => row.meta?.transactions,
      },
      {
        label: "",
        sx: { maxWidth: 44, minWidth: 44, width: 44 },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <>
      <MemoryTable<Connection>
        initOrderBy="timestamp"
        headCells={headCells}
        TableRowComponent={ConnectionTableRow}
        rows={rows}
        queryTime={queryTime}
        emptyContent={
          <Button sx={{ padding: 4 }} onClick={toggleOpen}>
            <Typography color="text.secondary" variant="body2" component="div">
              <Stack alignItems="center">
                <CloudOutlined sx={{ height: 64, width: 64 }} />
                <span>
                  Click to <u>add a new connection</u>.
                </span>
              </Stack>
            </Typography>
          </Button>
        }
        addNewRow={
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <AttentionBlock component={Button} onClick={toggleOpen} fullWidth>
            <Add sx={{ height: 20, width: 20 }} />
            <span>
              Click to <u>add a new connection</u>.
            </span>
          </AttentionBlock>
        }
      />
      <Stack paddingTop={1}>
        <Callout>
          <AlertTitle sx={{ fontSize: "0.85rem" }}>What are connections?</AlertTitle>
          <Box sx={{ maxWidth: 590 }}>
            Connections allow you to import data without having to manually upload <code>.csv</code>{" "}
            files.
            <br /> Connections can retrieve information from the public blockchain, given a public
            wallet address, or connect to a supported exchange given an API key.
          </Box>
        </Callout>
      </Stack>
      <ConnectionDrawer open={open} toggleOpen={toggleOpen} />
    </>
  )
}
