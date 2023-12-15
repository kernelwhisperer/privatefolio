import { Stack, Tooltip, Typography } from "@mui/material"
import { grey } from "@mui/material/colors"
import React from "react"

import { Timestamp } from "../interfaces"
import {
  formatDate,
  formatDateRelative,
  formatDateWithHour,
  formatHour,
} from "../utils/formatting-utils"

type TimestampCellProps = {
  relative?: boolean
  timestamp: Timestamp
}

export function TimestampCell(props: TimestampCellProps) {
  const { timestamp, relative } = props

  return (
    <Tooltip
      title={
        <Stack>
          <span>
            {formatDateWithHour(timestamp, {
              second: "numeric",
              timeZoneName: "short",
            })}{" "}
            <Typography color={grey[400]} component="i" variant="inherit">
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
          <span>
            {/* TODO this should go under a DevMode/Debug option */}
            {timestamp}{" "}
            <Typography color={grey[400]} component="i" variant="inherit">
              unix timestamp
            </Typography>
          </span>
        </Stack>
      }
    >
      <span>
        {relative ? (
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
  )
}
