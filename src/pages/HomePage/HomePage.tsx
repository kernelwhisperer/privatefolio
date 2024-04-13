import { Stack } from "@mui/material"
import React from "react"
import { useSearchParams } from "react-router-dom"
import { NavTab } from "src/components/NavTab"
import { Tabs } from "src/components/Tabs"

import { BalancesActions } from "../BalancesPage/BalancesActions"
import BalancesPage from "../BalancesPage/BalancesPage"
import { BreakdownChart } from "../BalancesPage/BreakdownChart"
import { PnLPage } from "../PnLPage/PnLPage"

const defaultTab = "networth"

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get("tab") || defaultTab

  return (
    <main>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Tabs value={tab} defaultValue={defaultTab} largeSize>
          <NavTab value="networth" to="?tab=networth" label="Net worth" />
          <NavTab value="pnl" to="?tab=pnl" label="Profit & loss" />
          <NavTab
            value="breakdown"
            to="?tab=breakdown"
            label={
              <span>
                Breakdown{" "}
                {/* <Chip
                  label="Work in progress"
                  size="small"
                  component="span"
                  sx={{
                    // backgroundColor: "rgba(255, 255, 255, 0.05)",
                    //  display: "inline-flex"
                    borderRadius: 2,
                    color: "inherit",
                    fontFamily: "inherit",
                    // verticalAlign: "text-top",
                  }}
                /> */}
              </span>
            }
          />
        </Tabs>
        {tab === "networth" && <BalancesActions />}
      </Stack>
      {tab === "networth" && <BalancesPage />}
      {tab === "pnl" && <PnLPage />}
      {tab === "breakdown" && <BreakdownChart />}
    </main>
  )
}
