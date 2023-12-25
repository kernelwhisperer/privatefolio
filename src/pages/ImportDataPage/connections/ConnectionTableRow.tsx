import { HighlightOffRounded } from "@mui/icons-material"
import {
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { MouseEvent, useState } from "react"
import { IntegrationAvatar } from "src/components/IntegrationAvatar"
import { TimestampCell } from "src/components/TimestampCell"
import { Truncate } from "src/components/Truncate"
import { Connection } from "src/interfaces"
import { INTEGRATIONS } from "src/settings"
import { $integrationMap } from "src/stores/metadata-store"
import { enqueueTask } from "src/stores/task-store"
import { MonoFont } from "src/theme"
import { formatNumber } from "src/utils/formatting-utils"
import { TableRowComponentProps } from "src/utils/table-utils"
import { clancy } from "src/workers/remotes"

export function ConnectionTableRow(props: TableRowComponentProps<Connection>) {
  const { row, relativeTime, headCells: _headCells, ...rest } = props
  const { address, timestamp, integration, label } = row

  const integrationMap = useStore($integrationMap)

  const [loading, setLoading] = useState(false)

  function handleRemove(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setLoading(true)
    enqueueTask({
      description: `Remove "${row.label}", alongside its audit logs and transactions.`,
      determinate: true,
      function: async (progress) => {
        try {
          await clancy.removeConnection(row, progress)
        } finally {
          setLoading(false)
        }
      },
      name: `Remove file import`,
      priority: 8,
    })
    // handleAuditLogChange() TODO
  }

  const meta: any = {
    logs: 0,
    transactions: 0,
  }

  return (
    <TableRow
      hover
      {...rest}
      // sx={(theme) => ({
      //   [theme.breakpoints.down("lg")]: {
      //     display: "flex",
      //     flexWrap: "wrap",
      //     // backgroundColor: theme.palette.secondary.main,
      //   },
      // })}
    >
      <TableCell sx={{ maxWidth: 180, minWidth: 180, width: 180 }}>
        <TimestampCell timestamp={timestamp} relative={relativeTime} />
      </TableCell>
      <TableCell sx={{ maxWidth: 160, minWidth: 160, width: 140 }}>
        {integration ? (
          <Stack direction="row" gap={0.5} alignItems="center" component="div">
            <IntegrationAvatar
              size="small"
              src={integrationMap[integration]?.image}
              alt={INTEGRATIONS[integration]}
            />
            <span>{INTEGRATIONS[integration]}</span>
          </Stack>
        ) : (
          <Skeleton></Skeleton>
        )}
      </TableCell>
      <TableCell sx={{ maxWidth: "100%", minWidth: "100%", width: "100%" }}>
        <Tooltip title={label}>
          <Truncate>{label}</Truncate>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ fontFamily: MonoFont, maxWidth: 400, minWidth: 400, width: 400 }}>
        <Tooltip title={address}>
          <Truncate>{address}</Truncate>
        </Tooltip>
      </TableCell>
      {/* <TableCell sx={{ maxWidth: 180, minWidth: 180, width: 180 }}>
        <TimestampCell timestamp={lastModified} relative={relativeTime} />
      </TableCell> */}
      <TableCell
        sx={{ fontFamily: MonoFont, maxWidth: 128, minWidth: 128, width: 128 }}
        align="right"
      >
        {!meta ? (
          <Skeleton></Skeleton>
        ) : (
          <>
            {meta.logs === meta.rows ? (
              <span>{formatNumber(meta.logs)}</span>
            ) : (
              <Tooltip
                title={`${formatNumber(meta.logs)} audit logs extracted from ${formatNumber(
                  meta.rows
                )} document entries`}
              >
                <span>{formatNumber(meta.logs)}</span>
              </Tooltip>
            )}
          </>
        )}
      </TableCell>
      <TableCell
        sx={{ fontFamily: MonoFont, maxWidth: 120, minWidth: 120, width: 120 }}
        align="right"
      >
        {!meta ? (
          <Skeleton></Skeleton>
        ) : (
          <>
            <Tooltip
              title={`${formatNumber(meta.transactions)} transactions extracted from ${formatNumber(
                meta.rows
              )} document entries`}
            >
              <span>{formatNumber(meta.transactions)}</span>
            </Tooltip>
          </>
        )}
      </TableCell>
      <TableCell sx={{ maxWidth: 40, minWidth: 40, width: 40 }}>
        <Tooltip title={loading ? "Removing..." : "Remove connection (including its audit logs)"}>
          <span>
            <IconButton
              size="small"
              color="secondary"
              sx={{ height: 28, marginLeft: -1 }}
              onClick={handleRemove}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <HighlightOffRounded fontSize="inherit" />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
