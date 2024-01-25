import { Add, CloudOutlined } from "@mui/icons-material"
import { AlertTitle, IconButton, Link, Paper, Stack, Tooltip, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import { proxy } from "comlink"
import React, { useEffect, useMemo, useState } from "react"
import { Callout } from "src/components/Callout"
import { MemoryTable } from "src/components/EnhancedTable/MemoryTable"
import { StaggeredList } from "src/components/StaggeredList"
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
      //   key: "integration",
      //   label: "Integration",
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
        label: (
          <>
            <Tooltip title="Add a new connection">
              <span>
                <IconButton
                  size="small"
                  color="secondary"
                  sx={{ height: 28, marginLeft: -1 }}
                  onClick={toggleOpen}
                >
                  <Add fontSize="inherit" />
                </IconButton>
              </span>
            </Tooltip>
          </>
        ),
        numeric: true,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <>
      {queryTime !== null && rows.length === 0 ? (
        <Paper
          sx={(theme) => ({
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
            borderStyle: "dashed",
            // borderWidth: 2,
            color: theme.palette.text.primary,
            cursor: "pointer",
            padding: 4,
            // padding: 1,
            textAlign: "center",
            transition: theme.transitions.create("background-color", {
              duration: theme.transitions.duration.shortest,
            }),
          })}
          onClick={toggleOpen}
        >
          <Typography color="text.secondary" variant="body2" component="div">
            <Stack alignItems="center" gap={4}>
              <Stack alignItems="center">
                <CloudOutlined sx={{ height: 64, width: 64 }} />
                <span>Nothing to see here...</span>
              </Stack>
              <span>
                Click this card to <u>add a new connection</u>.
              </span>
            </Stack>
          </Typography>
        </Paper>
      ) : (
        <MemoryTable<Connection>
          initOrderBy="timestamp"
          headCells={headCells}
          TableRowComponent={ConnectionTableRow}
          rows={rows}
          queryTime={queryTime}
          //
        />
      )}
      <StaggeredList component="main" paddingTop={1}>
        <Callout>
          <AlertTitle sx={{ fontSize: "0.85rem" }}>
            This feature is still being developed.
          </AlertTitle>
          If you have any ideas on how we can improve it, please{" "}
          <Link target="_blank" href="https://github.com/kernelwhisperer/privatefolio/issues/new">
            let us know
          </Link>
          !
        </Callout>
        {/* <Chip
            size="small"
            color="primary"
            sx={{ fontSize: "0.65rem", height: 20, paddingX: 0.5 }}
            label="BETA"
          /> */}
      </StaggeredList>
      <ConnectionDrawer open={open} toggleOpen={toggleOpen} />
    </>
  )
}
