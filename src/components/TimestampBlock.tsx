import { Stack, Tooltip, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"

import { Timestamp } from "../interfaces"
import { $debugMode } from "../stores/app-store"
import {
  formatDate,
  formatDateRelative,
  formatDateWithHour,
  formatHour,
} from "../utils/formatting-utils"

type TimestampBlockProps = {
  relative?: boolean
  timestamp: Timestamp
}

export function TimestampBlock(props: TimestampBlockProps) {
  const { timestamp, relative } = props

  const debugMode = useStore($debugMode)

  return (
    <Tooltip
      title={
        <Stack>
          <span>
            {formatDateWithHour(timestamp, {
              fractionalSecondDigits: debugMode ? 3 : undefined,
              second: "numeric",
              timeZoneName: "short",
            })}{" "}
            <span className="secondary">local</span>
          </span>
          <span>
            {formatDateWithHour(timestamp, {
              fractionalSecondDigits: debugMode ? 3 : undefined,
              second: "numeric",
              timeZone: "UTC",
              timeZoneName: "short",
            })}
          </span>
          {debugMode && (
            <span>
              {timestamp} <span className="secondary">unix timestamp</span>
            </span>
          )}
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
