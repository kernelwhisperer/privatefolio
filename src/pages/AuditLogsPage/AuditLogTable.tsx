import React, { useCallback, useMemo } from "react"

import {
  QueryFunction,
  RemoteTable,
  RemoteTableProps,
} from "../../components/EnhancedTable/RemoteTable"
import { AuditLog } from "../../interfaces"
import { HeadCell } from "../../utils/table-utils"
import { clancy } from "../../workers/remotes"
import { AuditLogTableRow } from "./AuditLogTableRow"

interface AuditLogsTableProps extends Pick<RemoteTableProps<AuditLog>, "defaultRowsPerPage"> {
  symbol?: string
}

export function AuditLogTable(props: AuditLogsTableProps) {
  const { symbol, ...rest } = props

  const queryFn: QueryFunction<AuditLog> = useCallback(
    async (filters, rowsPerPage, page, order) => {
      const auditLogs = await clancy.findAuditLogs({
        filters: { symbol, ...filters },
        limit: rowsPerPage,
        order,
        skip: page * rowsPerPage,
      })

      return [
        auditLogs,
        () =>
          clancy
            .findAuditLogs({
              fields: [],
              filters: { symbol, ...filters },
            })
            .then((logs) => logs.length),
      ]
    },
    [symbol]
  )

  const headCells = useMemo<HeadCell<AuditLog>[]>(
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
        key: "operation",
        label: "Operation",
      },
      {
        key: "changeN",
        label: "Change",
        numeric: true,
      },
      ...(!symbol
        ? ([
            {
              filterable: true,
              key: "symbol",
              label: "Asset",
            },
          ] as const)
        : []),
      {
        key: "balance",
        label: "New balance",
        numeric: true,
      },
    ],
    [symbol]
  )

  return (
    <>
      <RemoteTable
        initOrderBy="timestamp"
        headCells={headCells}
        queryFn={queryFn}
        TableRowComponent={AuditLogTableRow}
        {...rest}
      />
    </>
  )
}
