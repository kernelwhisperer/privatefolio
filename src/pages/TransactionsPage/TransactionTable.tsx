import React, { useCallback, useMemo } from "react"
import { $activeAccount } from "src/stores/account-store"

import {
  QueryFunction,
  RemoteTable,
  RemoteTableProps,
} from "../../components/EnhancedTable/RemoteTable"
import { Transaction } from "../../interfaces"
import { HeadCell } from "../../utils/table-utils"
import { clancy } from "../../workers/remotes"
import { TransactionTableRow } from "./TransactionTableRow"

interface TransactionsTableProps extends Pick<RemoteTableProps<Transaction>, "defaultRowsPerPage"> {
  symbol?: string
}

export function TransactionTable(props: TransactionsTableProps) {
  const { symbol, ...rest } = props

  const queryFn: QueryFunction<Transaction> = useCallback(
    async (filters, rowsPerPage, page, order) => {
      const selectorOverrides: PouchDB.Find.Selector = symbol
        ? {
            $or: [
              { outgoingAsset: symbol },
              { incomingAsset: symbol },
              // { feeAsset: symbol }, TODO
            ],
          }
        : {}

      const transactions = await clancy.findTransactions(
        {
          filters,
          limit: rowsPerPage,
          order,
          selectorOverrides,
          skip: page * rowsPerPage,
        },
        $activeAccount.get()
      )

      return [
        transactions,
        () =>
          clancy
            .findTransactions(
              {
                fields: [],
                filters,
                selectorOverrides,
              },
              $activeAccount.get()
            )
            .then((logs) => logs.length),
      ]
    },
    [symbol]
  )

  const headCells = useMemo<HeadCell<Transaction>[]>(
    () => [
      {
        key: "timestamp",
        label: "Timestamp",
        sortable: true,
      },
      {
        filterable: true,
        key: "platform",
        label: "Platform",
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
        key: "outgoingAsset",
        label: "Asset",
      },
      {
        key: "incomingN",
        label: "Incoming",
        numeric: true,
      },
      {
        filterable: true,
        key: "incomingAsset",
        label: "Asset",
      },
      {
        label: "",
      },
    ],
    []
  )

  return (
    <>
      <RemoteTable
        initOrderBy="timestamp"
        headCells={headCells}
        queryFn={queryFn}
        TableRowComponent={TransactionTableRow}
        {...rest}
      />
    </>
  )
}
