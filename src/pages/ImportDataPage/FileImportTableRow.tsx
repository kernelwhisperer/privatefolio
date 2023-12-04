import { HighlightOffRounded } from "@mui/icons-material"
import {
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  TableRowProps,
  Tooltip,
} from "@mui/material"
import { useStore } from "@nanostores/react"
// import TableCell from "@mui/material/Unstable_TableCell2" // TableCell version 2
import React, { MouseEvent, useState } from "react"

import { removeFileImport } from "../../api/file-import-api"
import { IntegrationAvatar } from "../../components/IntegrationAvatar"
import { TimestampCell } from "../../components/TimestampCell"
import { FileImport } from "../../interfaces"
import { $integrationMap } from "../../stores/metadata-store"
import { MonoFont } from "../../theme"
import { formatFileSize, formatNumber } from "../../utils/client-utils"

interface FileImportTableRowProps extends TableRowProps {
  fileImport: FileImport
  relativeTime: boolean
}

export function FileImportTableRow(props: FileImportTableRowProps) {
  const { fileImport, relativeTime, ...rest } = props
  const { name, meta, timestamp, lastModified, size } = fileImport
  const integration = meta?.integration

  const integrationMap = useStore($integrationMap)

  const [loading, setLoading] = useState(false)

  async function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setLoading(true)
    await removeFileImport(fileImport)
    setLoading(false)
  }

  return (
    <TableRow
      {...rest}
      // sx={(theme) => ({
      //   [theme.breakpoints.down("lg")]: {
      //     display: "flex",
      //     flexWrap: "wrap",
      //     // backgroundColor: theme.palette.secondary.main,
      //   },
      // })}
    >
      <TableCell sx={{ maxWidth: 200, minWidth: 200, width: 200 }}>
        <TimestampCell timestamp={timestamp} relative={relativeTime} />
      </TableCell>
      <TableCell sx={{ maxWidth: 200, minWidth: 200, width: 200 }}>{name}</TableCell>
      <TableCell
        sx={{ fontFamily: MonoFont, maxWidth: 140, minWidth: 140, width: 140 }}
        align="right"
      >
        {formatFileSize(size)}
      </TableCell>
      <TableCell sx={{ maxWidth: 200, minWidth: 200, width: 200 }}>
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
        sx={{ fontFamily: MonoFont, maxWidth: 160, minWidth: 160, width: 140 }}
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
                <span>
                  {formatNumber(meta.logs)} ({formatNumber(meta.rows)})
                </span>
              </Tooltip>
            )}
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
