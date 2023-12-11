import { Typography } from "@mui/material"
import React, { useEffect, useMemo, useState } from "react"

import { getLatestBalances } from "../../api/balances-api"
import { MemoryTable } from "../../components/EnhancedTable/MemoryTable"
import { StaggeredList } from "../../components/StaggeredList"
import { Balance } from "../../interfaces"
import { SerifFont } from "../../theme"
import { HeadCell } from "../../utils/table-utils"
import { BalancesChart } from "./BalancesChart"
import { BalanceTableRow } from "./BalanceTableRow"

export function BalancesPage({ show }: { show: boolean }) {
  const [balances, setBalances] = useState<Balance[]>([])

  useEffect(() => {
    getLatestBalances().then(setBalances)
  }, [])

  const headCells = useMemo<HeadCell<Balance>[]>(
    () => [
      {
        filterable: true,
        key: "symbol",
        label: "Asset",
        sortable: true,
      },
      {
        key: "balance",
        label: "Balance",
        numeric: true,
        sortable: true,
      },
      {
        key: "price",
        label: "Price",
        numeric: true,
        sortable: true,
        valueSelector: (row: Balance) => row.price?.close || 0,
      },
      // {
      //   key: "value" as ,
      //   label: "Value",
      //   numeric: true,
      //   sortable: true,
      // },
    ],
    []
  )

  return (
    <StaggeredList gap={1} show={show}>
      <Typography variant="h6" fontFamily={SerifFont}>
        <span>Breakdown</span>
      </Typography>
      <BalancesChart />
      <Typography variant="h6" fontFamily={SerifFont}>
        <span>Balances</span>
      </Typography>
      <MemoryTable<Balance>
        initOrderBy="balance"
        headCells={headCells}
        TableRowComponent={BalanceTableRow}
        rows={balances}
        defaultRowsPerPage={10}
        //
      />
    </StaggeredList>
  )
}
