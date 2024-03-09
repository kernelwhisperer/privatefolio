import { Box, CircularProgressProps } from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { useMemo } from "react"

import { $pendingTask, $progressHistory } from "../../stores/task-store"
import { CircularSpinner } from "../CircularSpinner"

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
    <Box sx={sx}>
      <CircularSpinner
        variant={task.determinate ? "determinate" : "indeterminate"}
        disableShrink={!task.determinate}
        color="secondary"
        size={14}
        thickness={4.5}
        value={progressPercent}
        {...rest}
      />
    </Box>
  )
}
