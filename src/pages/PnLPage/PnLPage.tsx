import React from "react"
import { StaggeredList } from "src/components/StaggeredList"
import { Subheading } from "src/components/Subheading"

import { PnLChart } from "./PnLChart"

export function PnLPage({ show }: { show: boolean }) {
  return (
    <StaggeredList component="main" gap={2} show={show}>
      <div>
        <Subheading>
          <span>Profit & loss</span>
        </Subheading>
        <PnLChart />
      </div>
    </StaggeredList>
  )
}
