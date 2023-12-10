import React, { useCallback, useMemo } from "react"

import { findTransactions } from "../../api/transactions-api"
import { QueryFunction, RemoteTable } from "../../components/RemoteTable/RemoteTable"
import { HeadCell } from "../../components/RemoteTable/RemoteTableHead"
import { Transaction } from "../../interfaces"
import { TransactionTableRow } from "./TransactionTableRow"

interface TransactionsTableProps {
  symbol?: string
}

export function TransactionTable(props: TransactionsTableProps) {
  const { symbol } = props

  const headCells = useMemo<HeadCell<Transaction>[]>(
    () => [
      {
        key: "timestamp",
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
        key: "outgoingN",
        label: "Outgoing",
        numeric: true,
      },
      {
        filterable: true,
        key: "outgoingSymbol",
        label: "Asset",
      },
      {
        key: "incomingN",
        label: "Incoming",
        numeric: true,
      },
      {
        filterable: true,
        key: "incomingSymbol",
        label: "Asset",
      },
    ],
    []
  )

  const queryFn: QueryFunction<Transaction> = useCallback(
    async (filters, rowsPerPage, page, order) => {
      const transactions = await findTransactions({
        filters,
        limit: rowsPerPage,
        order,
        skip: page * rowsPerPage,
      })
      console.log("📜 LOG > getTransactions > transactions:", transactions)

      return [
        transactions,
        () =>
          findTransactions({
            fields: [],
            filters,
          }).then((logs) => logs.length),
      ]
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
