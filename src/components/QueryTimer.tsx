import { TimerSharp } from "@mui/icons-material"
import { CircularProgress, Skeleton, Stack, Tooltip, Typography } from "@mui/material"
import React from "react"

import { MonoFont } from "../theme"
import { formatNumber } from "../utils/formatting-utils"

export function QueryTimer({ queryTime }: { queryTime: number | null }) {
  return (
    <>
      <Tooltip
        title={null}
        // title={
        //   queryTime ? (
        //     <Stack>
        //       <span>Fetch query time: 0.1s</span>
        //       <span>Count query time: 0.1s</span>
        //       <Typography color={grey[400]} component="i" variant="inherit">
        //         these operations can take a long time because they are read from the
        //         disk
        //       </Typography>
        //     </Stack>
        //   ) : null
        // }
      >
        <Typography
          variant="caption"
          color="text.secondary"
          component={Stack}
          paddingX={1.5}
          sx={{ minWidth: 100 }}
          fontFamily={MonoFont}
          direction="row"
          gap={1}
          marginTop={0.25}
        >
          {queryTime === null ? (
            <>
              <CircularProgress size={14} color="inherit" sx={{ margin: "3px" }} />
              <Skeleton sx={{ flexGrow: 1 }}></Skeleton>
            </>
          ) : (
            <>
              <TimerSharp fontSize="small" />
              <span>
                {formatNumber(queryTime / 1000, {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}
                s
              </span>
            </>
          )}
        </Typography>
      </Tooltip>
    </>
  )
}
