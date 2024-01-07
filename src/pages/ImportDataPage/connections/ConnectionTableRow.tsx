import { HighlightOffRounded, SyncRounded } from "@mui/icons-material"
import {
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { MouseEvent, useState } from "react"
import { IntegrationAvatar } from "src/components/IntegrationAvatar"
import { TimestampBlock } from "src/components/TimestampBlock"
import { Truncate } from "src/components/Truncate"
import { useConfirm } from "src/hooks/useConfirm"
import { Connection } from "src/interfaces"
import { INTEGRATIONS } from "src/settings"
import { $activeAccount } from "src/stores/account-store"
import { $integrationMap } from "src/stores/metadata-store"
import { enqueueTask, TaskPriority } from "src/stores/task-store"
import { MonoFont } from "src/theme"
import { formatNumber } from "src/utils/formatting-utils"
import { TableRowComponentProps } from "src/utils/table-utils"
import { clancy } from "src/workers/remotes"

export function ConnectionTableRow(props: TableRowComponentProps<Connection>) {
  const {
    row,
    relativeTime,
    headCells: _headCells,
    isMobile: _isMobile,
    isTablet: _isTablet,
    ...rest
  } = props
  const { address, timestamp, syncedAt, integration, label, meta } = row

  const integrationMap = useStore($integrationMap)

  const [isRemoving, setIsRemoving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const confirm = useConfirm()

  async function handleRemove(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    const { confirmed } = await confirm({
      content: (
        <>
          All audit logs and transactions linked to this connection will be deleted.
          <br /> This action is permanent. Are you sure you wish to continue?
        </>
      ),
      title: "Remove connection",
      variant: "warning",
    })

    if (!confirmed) return

    setIsRemoving(true)
    enqueueTask({
      description: `Remove "${row.label}", alongside its audit logs and transactions.`,
      determinate: true,
      function: async (progress) => {
        try {
          await clancy.removeConnection(row, progress, $activeAccount.get())
        } finally {
          setIsRemoving(false)
        }
      },
      name: `Remove file import`,
      priority: TaskPriority.High,
    })
    // handleAuditLogChange() TODO
  }

  async function handleSync(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    setIsSyncing(true)
    enqueueTask({
      description: `Sync "${row.address}"`,
      determinate: true,
      function: async (progress) => {
        try {
          await clancy.syncConnection(progress, row, $activeAccount.get())
        } finally {
          setIsSyncing(false)
        }
      },
      name: `Sync connection`,
      priority: TaskPriority.High,
    })
    // handleAuditLogChange() TODO
  }

  return (
    <TableRow hover {...rest}>
      <TableCell sx={{ maxWidth: 180, minWidth: 180, width: 180 }}>
        <TimestampBlock timestamp={timestamp} relative={relativeTime} />
      </TableCell>
      <TableCell sx={{ maxWidth: 180, minWidth: 180, width: 180 }}>
        {!syncedAt ? (
          <Typography color="text.secondary" component="span" variant="inherit">
            Not synced
          </Typography>
        ) : (
          <TimestampBlock timestamp={syncedAt} relative={relativeTime} />
        )}
      </TableCell>
      <TableCell sx={{ maxWidth: 24, minWidth: 24, width: 24 }}>
        {integration ? (
          <Stack direction="row" gap={0.5} alignItems="center" component="div">
            <IntegrationAvatar
              size="small"
              src={integrationMap[integration]?.image}
              alt={INTEGRATIONS[integration]}
            />
          </Stack>
        ) : (
          <Skeleton></Skeleton>
        )}
      </TableCell>
      <TableCell sx={{ fontFamily: MonoFont, maxWidth: 300, minWidth: 300, width: 300 }}>
        <Stack spacing={1} direction="row">
          <Tooltip title={address}>
            <Truncate>{address}</Truncate>
          </Tooltip>
          <Typography color="text.secondary" component="span" variant="inherit">
            {" "}
            {label}
          </Typography>
        </Stack>
      </TableCell>
      {/* <TableCell sx={{ fontFamily: MonoFont, maxWidth: 400, minWidth: 400, width: 400 }}>
        <Tooltip title={address}>
          <Truncate>{address}</Truncate>
        </Tooltip>
      </TableCell> */}
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
      <TableCell sx={{ maxWidth: 80, minWidth: 80, width: 80 }}>
        <Stack direction="row" gap={1} justifyContent="flex-end">
          <Tooltip title={isRemoving ? "Syncing..." : "Sync connection"}>
            <span>
              <IconButton
                size="small"
                color="secondary"
                sx={{ height: 28, marginLeft: -1 }}
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isRemoving ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <SyncRounded fontSize="inherit" />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip
            title={isRemoving ? "Removing..." : "Remove connection (including its audit logs)"}
          >
            <span>
              <IconButton
                size="small"
                color="secondary"
                sx={{ height: 28, marginLeft: -1 }}
                onClick={handleRemove}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <HighlightOffRounded fontSize="inherit" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  )
}
