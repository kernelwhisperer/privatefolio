import { Stack } from "@mui/material"
import React from "react"
import { WorkInProgressCallout } from "src/components/WorkInProgressCallout"

import { PnLChart } from "./PnLChart"

export function PnLPage() {
  return (
    <Stack gap={1}>
      <PnLChart />
      <WorkInProgressCallout />
    </Stack>
  )
}
