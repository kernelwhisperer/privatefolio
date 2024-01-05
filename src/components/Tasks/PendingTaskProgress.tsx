import { Box, CircularProgress, CircularProgressProps } from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { useMemo } from "react"

import { $pendingTask, $progressHistory } from "../../stores/task-store"

export function PendingTaskProgress({ sx = {}, ...rest }: CircularProgressProps) {
  const task = useStore($pendingTask)

  const progressHistory = useStore($progressHistory, { keys: task ? [task.id] : [] })
  const completed = task && "completedAt" in task && task.completedAt

  const progressPercent = useMemo(() => {
    if (completed) {
      return 100
    }
    const updateMap = task ? progressHistory[task.id] : {}
    const updates = Object.keys(updateMap)

    if (!updates?.length) {
      return 0
    }

    const lastUpdate = updates[updates.length - 1]
    return updateMap[lastUpdate][0] || 0
  }, [completed, progressHistory, task])

  if (!task) {
    return null
  }

  return (
    <Box sx={{ fontSize: "14px !important", height: 14, position: "relative", width: 14, ...sx }}>
      <CircularProgress
        variant="determinate"
        sx={{
          // color: (theme) => theme.palette.grey[theme.palette.mode === "light" ? 300 : 800],
          // color: "var(--mui-palette-LinearProgress-infoBg)",
          color: "var(--mui-palette-LinearProgress-secondaryBg)",
          left: 0,
          position: "absolute",
          top: 0,
        }}
        size={14}
        thickness={4.5}
        {...rest}
        value={100}
      />
      <CircularProgress
        key={task.id}
        variant={task.determinate ? "determinate" : "indeterminate"}
        disableShrink={!task.determinate}
        // color="info"
        color="secondary"
        sx={{
          left: 0,
          position: "absolute",
          top: 0,
        }}
        size={14}
        thickness={4.5}
        value={progressPercent}
        {...rest}
      />
    </Box>
  )
}
