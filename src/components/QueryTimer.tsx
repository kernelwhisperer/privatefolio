import { TimerSharp } from "@mui/icons-material"
import { Skeleton, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material"
import React from "react"

import { MonoFont } from "../theme"
import { formatDuration } from "../utils/formatting-utils"
import { CircularSpinner } from "./CircularSpinner"

export function QueryTimer({ queryTime }: { queryTime: number | null }) {
  const isMobile = useMediaQuery("(max-width: 599px)")

  return (
    <>
      <Tooltip
        title={
          queryTime ? (
            <Stack>
              <span>Query time: {formatDuration(queryTime / 1000)}</span>
              {/* <span>Count query time: 0.1s</span> */}
              <span className="secondary">
                Fetching this data can take long because it is read from disk.
              </span>
            </Stack>
          ) : null
        }
      >
        <Typography
          variant="caption"
          color="text.secondary"
          component={Stack}
          sx={{ minWidth: isMobile ? undefined : 100 }}
          fontFamily={MonoFont}
          direction="row"
          gap={1}
          marginTop={0.25}
        >
          {queryTime === null ? (
            <>
              <CircularSpinner size={14} color="inherit" sx={{ margin: "3px" }} />
              {isMobile ? null : <Skeleton sx={{ flexGrow: 1 }}></Skeleton>}
            </>
          ) : (
            <>
              <TimerSharp fontSize="small" sx={{ padding: 0.25 }} />
              {isMobile ? null : <span>{formatDuration(queryTime / 1000)}</span>}
            </>
          )}
        </Typography>
      </Tooltip>
    </>
  )
}
