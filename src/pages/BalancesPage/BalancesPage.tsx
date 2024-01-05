import React, { useEffect, useMemo, useState } from "react"
import { $activeAccount } from "src/stores/account-store"

import { MemoryTable } from "../../components/EnhancedTable/MemoryTable"
import { NoDataCard } from "../../components/NoDataCard"
import { StaggeredList } from "../../components/StaggeredList"
import { Subheading } from "../../components/Subheading"
import { Balance } from "../../interfaces"
import { HeadCell } from "../../utils/table-utils"
import { clancy } from "../../workers/remotes"
import { BalancesChart } from "./BalancesChart"
import { BalanceTableRow } from "./BalanceTableRow"

export default function BalancesPage({ show }: { show: boolean }) {
  const [queryTime, setQueryTime] = useState<number | null>(null)
  const [rows, setRows] = useState<Balance[]>([])

  useEffect(() => {
    const start = Date.now()
    clancy.getLatestBalances($activeAccount.get()).then((balances) => {
      setQueryTime(Date.now() - start)
      setRows(balances)
    })
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
        key: "price",
        label: "Price",
        numeric: true,
        sortable: true,
        valueSelector: (row: Balance) => row.price?.value,
      },
      {
        key: "balance",
        label: "Balance",
        numeric: true,
        sortable: true,
      },
      {
        key: "value",
        label: "Value",
        numeric: true,
        sortable: true,
      },
    ],
    []
  )

  return (
    <StaggeredList component="main" gap={2} show={show}>
      {queryTime !== null && rows.length === 0 ? null : (
        <div>
          <Subheading>
            <span>Net worth</span>
          </Subheading>
          <BalancesChart />
        </div>
      )}
      <div>
        <Subheading>
          <span>Balances</span>
        </Subheading>
        {queryTime !== null && rows.length === 0 ? (
          <NoDataCard />
        ) : (
          <MemoryTable<Balance>
            initOrderBy="value"
            headCells={headCells}
            TableRowComponent={BalanceTableRow}
            rows={rows}
            defaultRowsPerPage={10}
            queryTime={queryTime}
          />
        )}
      </div>
    </StaggeredList>
  )
}
