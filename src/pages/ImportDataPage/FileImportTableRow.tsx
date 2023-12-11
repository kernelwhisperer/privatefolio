import { HighlightOffRounded } from "@mui/icons-material"
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
import { grey } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
import React, { MouseEvent, useState } from "react"

import { removeFileImport } from "../../api/file-import-api"
import { IntegrationAvatar } from "../../components/IntegrationAvatar"
import { TimestampCell } from "../../components/TimestampCell"
import { Truncate } from "../../components/Truncate"
import { FileImport } from "../../interfaces"
import { $integrationMap } from "../../stores/metadata-store"
import { MonoFont } from "../../theme"
import { formatFileSize, formatNumber } from "../../utils/client-utils"
import { TableRowComponentProps } from "../../utils/table-utils"

export function FileImportTableRow(props: TableRowComponentProps<FileImport>) {
  const { row, relativeTime, headCells: _headCells, ...rest } = props
  const { name, meta, timestamp, lastModified, size } = row
  const integration = meta?.integration

  const integrationMap = useStore($integrationMap)

  const [loading, setLoading] = useState(false)

  async function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setLoading(true)
    await removeFileImport(row)
    setLoading(false)
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
              <Typography color={grey[400]} component="i" variant="inherit">
                <span>{formatNumber(size)} Bytes</span>
              </Typography>
            </Stack>
          }
        >
          <span>{formatFileSize(size)}</span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ maxWidth: 180, minWidth: 180, width: 180 }}>
        <TimestampCell timestamp={lastModified} relative={relativeTime} />
      </TableCell>
      <TableCell sx={{ maxWidth: 160, minWidth: 160, width: 140 }}>
        {integration ? (
          <Stack direction="row" gap={0.5} alignItems="center" component="div">
            <IntegrationAvatar
              size="small"
              src={integrationMap[integration]?.image}
              alt={integration}
            />
            <span>{integration}</span>
          </Stack>
        ) : (
          <Skeleton></Skeleton>
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
        <Tooltip title="Delete file import (including its audit logs)">
          <IconButton
            size="small"
            sx={{ height: 28, marginLeft: -1 }}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <HighlightOffRounded fontSize="inherit" />
            )}
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
