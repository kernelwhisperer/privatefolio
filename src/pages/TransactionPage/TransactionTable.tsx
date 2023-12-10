import React, { useCallback, useMemo } from "react"

import { getTransactions } from "../../api/transactions-api"
import { QueryFunction, RemoteTable } from "../../components/RemoteTable/RemoteTable"
import { HeadCell } from "../../components/RemoteTable/RemoteTableHead"
import { Transaction } from "../../interfaces"
import { ActiveFilterMap } from "../../stores/audit-log-store"
import { Order } from "../../utils/table-utils"
import { TransactionTableRow } from "./TransactionTableRow"

interface TransactionsTableProps {
  symbol?: string
}

export function TransactionTable(props: TransactionsTableProps) {
  const { symbol } = props

  const headCells = useMemo<HeadCell<Transaction>[]>(
    () => [
      {
        key: "symbol",
        label: "Timestamp",
        sortable: true,
      },
      {
        filterable: true,
        key: "integration",
        label: "Integration",
      },
      {
        filterable: true,
        key: "wallet",
        label: "Wallet",
      },
      {
        filterable: true,
        key: "type",
        label: "Type",
      },
      {
        key: "amountN",
        label: "Outgoing",
        numeric: true,
      },
      {
        key: "symbol",
        label: "Asset",
      },
      {
        key: "totalN",
        label: "Incoming",
        numeric: true,
      },
      {
        key: "quoteSymbol",
        label: "Asset",
      },
    ],
    []
  )

  const queryFn: QueryFunction<Transaction> = useCallback(
    async (filters: ActiveFilterMap, rowsPerPage: number, page: number, order: Order) => {
      const transactions = await getTransactions()
      //   {
      //   filters,
      //   limit: rowsPerPage,
      //   order,
      //   skip: page * rowsPerPage,
      // }
      console.log("📜 LOG > getTransactions > transactions:", transactions)

      // const count = await findAuditLogs({
      //   fields: [],
      //   filters,
      // })
      // setRowCount(count.length)
      return [transactions.slice(0, 10), transactions.length] as const
    },
    []
  )

  return (
    <>
      <RemoteTable
        headCells={headCells}
        queryFn={queryFn}
        TableRowComponent={TransactionTableRow}
      />
    </>
  )
}
