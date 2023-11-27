import { HighlightOffRounded } from "@mui/icons-material"
import {
  Avatar,
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  TableRowProps,
  Tooltip,
} from "@mui/material"
// import TableCell from "@mui/material/Unstable_TableCell2" // TableCell version 2
import React, { MouseEvent, useState } from "react"

import { FileImport, removeFileImport } from "../../api/file-import-api"
import { TimestampCell } from "../../components/TimestampCell"
import { Exchange } from "../../interfaces"
import { MonoFont } from "../../theme"
import { formatFileSize, formatNumber } from "../../utils/client-utils"

interface FileImportTableRowProps extends TableRowProps {
  fileImport: FileImport
  integrationMap: Record<string, Exchange>
  relativeTime: boolean
}

export function FileImportTableRow(props: FileImportTableRowProps) {
  const { fileImport, integrationMap, relativeTime, ...rest } = props
  const { name, integration, timestamp, lastModified, size, logs } = fileImport

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
      <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>{name}</TableCell>
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
            <Avatar
              src={integrationMap[integration]?.image}
              sx={{
                borderRadius: "2px",
                height: 16,
                width: 16,
              }}
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
        {typeof logs === "undefined" ? <Skeleton></Skeleton> : formatNumber(logs)}
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
