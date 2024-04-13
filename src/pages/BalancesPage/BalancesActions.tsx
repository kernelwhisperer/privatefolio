import { CachedRounded } from "@mui/icons-material"
import { IconButton, Tooltip } from "@mui/material"
import React from "react"
import { refreshNetworth } from "src/utils/common-tasks"

export function BalancesActions() {
  return (
    <>
      <Tooltip title="Refresh networth">
        <IconButton color="secondary" onClick={refreshNetworth}>
          <CachedRounded fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  )
}
