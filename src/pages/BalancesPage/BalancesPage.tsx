import { Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

import { getLatestBalances } from "../../api/balances-api"
import { StaggeredList } from "../../components/StaggeredList"
import { Balance } from "../../interfaces"
import { SerifFont } from "../../theme"
import { BalancesChart } from "./BalancesChart"
import { BalanceTable } from "./BalanceTable"

export function BalancesPage({ show }: { show: boolean }) {
  const [balances, setBalances] = useState<Balance[]>([])

  useEffect(() => {
    getLatestBalances().then((balanceMap) => {
      if (!balanceMap) return

      const { _id, _rev, timestamp: _timestamp, ...map } = balanceMap
      const balances = Object.keys(map).map((x) => ({ balance: map[x], symbol: x }))

      setBalances(balances)
    })
  }, [])

  return (
    <StaggeredList gap={1} show={show}>
      <Typography variant="h6" fontFamily={SerifFont}>
        <span>Breakdown</span>
      </Typography>
      <BalancesChart />
      <Typography variant="h6" fontFamily={SerifFont}>
        <span>Balances</span>
      </Typography>
      <BalanceTable rows={balances} />
    </StaggeredList>
  )
}
