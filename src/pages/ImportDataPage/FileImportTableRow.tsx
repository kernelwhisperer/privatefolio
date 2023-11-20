import { HighlightOffRounded } from "@mui/icons-material"
import {
  IconButton,
  Stack,
  TableCell,
  TableRow,
  TableRowProps,
  Tooltip,
  Typography,
} from "@mui/material"
// import TableCell from "@mui/material/Unstable_TableCell2" // TableCell version 2
import React from "react"

import { FileImport, removeFileImport } from "../../api/file-import-api"
import { Exchange } from "../../interfaces"
import { MonoFont } from "../../theme"
import {
  formatDate,
  formatDateRelative,
  formatDateWithHour,
  formatFileSize,
  formatHour,
} from "../../utils/client-utils"

interface FileImportTableRowProps extends TableRowProps {
  fileImport: FileImport
  integrationMap: Record<string, Exchange>
  relativeTime: boolean
}

export function FileImportTableRow(props: FileImportTableRowProps) {
  const { fileImport, integrationMap, relativeTime, ...rest } = props
  const { name, timestamp, lastModified, size } = fileImport

  function handleDelete() {
    removeFileImport(fileImport)
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
        <Tooltip
          title={
            <Stack>
              <span>
                {formatDateWithHour(timestamp, {
                  second: "numeric",
                  timeZoneName: "short",
                })}{" "}
                <Typography color={"text.secondary"} component="i" variant="inherit">
                  local
                </Typography>
              </span>
              <span>
                {formatDateWithHour(timestamp, {
                  second: "numeric",
                  timeZone: "UTC",
                  timeZoneName: "short",
                })}
              </span>
            </Stack>
          }
        >
          <span>
            {relativeTime ? (
              <span>{formatDateRelative(timestamp)}</span>
            ) : (
              <>
                <span>{formatDate(timestamp)}</span>{" "}
                <Typography component="span" color="text.secondary" variant="inherit">
                  at {formatHour(timestamp)}
                </Typography>
              </>
            )}
          </span>
        </Tooltip>
      </TableCell>
      {/* <TableCell sx={{ maxWidth: 160, minWidth: 160, width: 140 }}>
        <Stack direction="row" gap={0.5} alignItems="center" component="div">
          <Avatar
            src={integrationMap[integration]?.image}
            sx={{
              borderRadius: "2px",
              height: 16,
              width: 16,
            }}
            alt={symbol}
          />
          <span>{integration}</span>
        </Stack>
      </TableCell> */}
      <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>{name}</TableCell>
      <TableCell sx={{ fontFamily: MonoFont, maxWidth: 140, minWidth: 140, width: 140 }}>
        {formatFileSize(size)}
      </TableCell>
      <TableCell sx={{ maxWidth: 200, minWidth: 200, width: 200 }}>
        <Tooltip
          title={
            <Stack>
              <span>
                {formatDateWithHour(lastModified, {
                  second: "numeric",
                  timeZoneName: "short",
                })}{" "}
                <Typography color={"text.secondary"} component="i" variant="inherit">
                  local
                </Typography>
              </span>
              <span>
                {formatDateWithHour(lastModified, {
                  second: "numeric",
                  timeZone: "UTC",
                  timeZoneName: "short",
                })}
              </span>
            </Stack>
          }
        >
          <span>
            {relativeTime ? (
              <span>{formatDateRelative(lastModified)}</span>
            ) : (
              <>
                <span>{formatDate(lastModified)}</span>{" "}
                <Typography component="span" color="text.secondary" variant="inherit">
                  at {formatHour(lastModified)}
                </Typography>
              </>
            )}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ maxWidth: 40, minWidth: 40, width: 40 }}>
        <Tooltip title="Delete">
          <IconButton size="small" sx={{ marginRight: 0.5 }} edge="start" onClick={handleDelete}>
            <HighlightOffRounded fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
