import { Stack, Tooltip, Typography } from "@mui/material"
import React from "react"

import {
  formatDate,
  formatDateRelative,
  formatDateWithHour,
  formatHour,
} from "../utils/client-utils"

type TimestampCellProps = {
  relative?: boolean
  timestamp: number
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
