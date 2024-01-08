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
import { TimestampBlock } from "src/components/TimestampBlock"
import { Truncate } from "src/components/Truncate"
import { FileImport } from "src/interfaces"
import { INTEGRATIONS } from "src/settings"
import { $activeAccount } from "src/stores/account-store"
import { $integrationMap } from "src/stores/metadata-store"
import { enqueueTask } from "src/stores/task-store"
import { MonoFont } from "src/theme"
import { handleAuditLogChange } from "src/utils/common-tasks"
import { formatFileSize, formatNumber } from "src/utils/formatting-utils"
import { TableRowComponentProps } from "src/utils/table-utils"
import { clancy } from "src/workers/remotes"

export function FileImportTableRow(props: TableRowComponentProps<FileImport>) {
  const { row, relativeTime, headCells: _headCells, isMobile: _isMobile, isTablet, ...rest } = props
  const { name, meta, timestamp, lastModified, size } = row
  const integration = meta?.integration

  const integrationMap = useStore($integrationMap)

  const [loading, setLoading] = useState(false)

  function handleRemove(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setLoading(true)
    enqueueTask({
      description: `Remove "${row.name}", alongside its audit logs and transactions.`,
      determinate: true,
      function: async (progress) => {
        try {
          const logsChanged = await clancy.removeFileImport(row, progress, $activeAccount.get())
          if (logsChanged > 0) {
            handleAuditLogChange()
          }
        } finally {
          // setLoading(false)
        }
      },
      name: `Remove file import`,
      priority: 8,
    })
  }

  if (isTablet) {
    return (
      <TableRow hover {...rest}>
        <TableCell sx={{ width: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack gap={0.5}>
              <Stack direction="row" gap={1} alignItems="center" component="div">
                {integration ? (
                  <IntegrationAvatar
                    size="small"
                    src={integrationMap[integration]?.image}
                    alt={INTEGRATIONS[integration]}
                  />
                ) : (
                  <Skeleton></Skeleton>
                )}
                <Tooltip title={name}>
                  <Truncate>{name}</Truncate>
                </Tooltip>
              </Stack>
              <Stack
                direction="row"
                gap={1}
                alignItems="center"
                component="div"
                sx={{ color: "text.secondary", fontSize: "0.75rem" }}
              >
                <TimestampBlock timestamp={timestamp} relative={relativeTime} />
                {" • "}
                <Tooltip
                  title={
                    <Stack>
                      <span>{formatFileSize(size, true)}</span>
                      <i className="secondary">
                        <span>{formatNumber(size)} Bytes</span>
                      </i>
                    </Stack>
                  }
                >
                  <span>{formatFileSize(size)}</span>
                </Tooltip>
              </Stack>
            </Stack>
            <Stack gap={0.5} alignItems={"flex-end"} sx={{ fontSize: "0.75rem" }}>
              {!meta ? (
                <Skeleton></Skeleton>
              ) : (
                <>
                  {meta.logs === meta.rows ? (
                    <span>{formatNumber(meta.logs)} audit logs</span>
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
              {!meta ? (
                <Skeleton></Skeleton>
              ) : (
                <>
                  <Tooltip
                    title={`${formatNumber(
                      meta.transactions
                    )} transactions extracted from ${formatNumber(meta.rows)} document entries`}
                  >
                    <span>{formatNumber(meta.transactions)} txns</span>
                  </Tooltip>
                </>
              )}
            </Stack>
          </Stack>
        </TableCell>
        <TableCell sx={{ maxWidth: 40, minWidth: 40, width: 40 }}>
          <Tooltip
            title={loading ? "Removing..." : "Remove file import (including its audit logs)"}
          >
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

  return (
    <TableRow hover {...rest}>
      <TableCell sx={{ maxWidth: 180, minWidth: 180, width: 180 }}>
        <TimestampBlock timestamp={timestamp} relative={relativeTime} />
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
      <TableCell sx={{ maxWidth: 200, minWidth: 200, width: 200 }}>
        <Tooltip title={name}>
          <Truncate>{name}</Truncate>
        </Tooltip>
      </TableCell>
      <TableCell
        sx={{ fontFamily: MonoFont, maxWidth: 120, minWidth: 120, width: 120 }}
        align="right"
      >
        <Tooltip
          title={
            <Stack>
              <span>{formatFileSize(size, true)}</span>
              <i className="secondary">
                <span>{formatNumber(size)} Bytes</span>
              </i>
            </Stack>
          }
        >
          <span>{formatFileSize(size)}</span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ maxWidth: 180, minWidth: 180, width: 180 }}>
        <TimestampBlock timestamp={lastModified} relative={relativeTime} />
      </TableCell>
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
        <Tooltip title={loading ? "Removing..." : "Remove file import (including its audit logs)"}>
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
