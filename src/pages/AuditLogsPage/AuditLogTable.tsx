import React, { useCallback, useMemo } from "react"

import { findAuditLogs } from "../../api/audit-logs-api"
import { QueryFunction, RemoteTable } from "../../components/RemoteTable/RemoteTable"
import { HeadCell } from "../../components/RemoteTable/RemoteTableHead"
import { AuditLog } from "../../interfaces"
import { ActiveFilterMap } from "../../stores/audit-log-store"
import { Order } from "../../utils/table-utils"
import { AuditLogTableRow } from "./AuditLogTableRow"

interface AuditLogsTableProps {
  symbol?: string
}

export function AuditLogTable(props: AuditLogsTableProps) {
  const { symbol } = props

  const queryFn: QueryFunction<AuditLog> = useCallback(
    async (filters: ActiveFilterMap, rowsPerPage: number, page: number, order: Order) => {
      const auditLogs = await findAuditLogs({
        filters: { symbol, ...filters },
        limit: rowsPerPage,
        order,
        skip: page * rowsPerPage,
      })

      return [
        auditLogs,
        () =>
          findAuditLogs({
            fields: [],
            filters: { symbol, ...filters },
          }).then((logs) => logs.length),
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
        headCells={headCells}
        queryFn={queryFn}
        TableRowComponent={AuditLogTableRow}
        //
      />
    </>
  )
}
