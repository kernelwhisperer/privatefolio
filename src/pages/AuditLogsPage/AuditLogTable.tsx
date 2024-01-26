import { Box } from "@mui/material"
import React, { useCallback, useMemo } from "react"
import { FilterChip } from "src/components/FilterChip"
import { $activeAccount } from "src/stores/account-store"
import { stringToColor } from "src/utils/color-utils"

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
  txId?: string
}

export function AuditLogTable(props: AuditLogsTableProps) {
  const { symbol, txId, ...rest } = props

  const queryFn: QueryFunction<AuditLog> = useCallback(
    async (filters, rowsPerPage, page, order) => {
      if (txId) {
        const auditLogs = await clancy.findAuditLogsForTxId(txId, $activeAccount.get())
        // auditLogs.sort((a, b) => (b.importIndex > a.importIndex ? -1 : 1))
        return [auditLogs, auditLogs.length]
      }

      const auditLogs = await clancy.findAuditLogs(
        {
          filters: { symbol, ...filters },
          limit: rowsPerPage,
          order,
          skip: page * rowsPerPage,
        },
        $activeAccount.get()
      )

      return [
        auditLogs,
        () =>
          clancy
            .findAuditLogs(
              {
                fields: [],
                filters: { symbol, ...filters },
              },
              $activeAccount.get()
            )
            .then((logs) => logs.length),
      ]
    },
    [symbol, txId]
  )

  const headCells = useMemo<HeadCell<AuditLog>[]>(
    () => [
      {
        key: "timestamp",
        label: "Timestamp",
        sortable: !txId,
      },
      {
        filterable: !txId,
        key: "integration",
        label: "Integration",
      },
      {
        filterable: !txId,
        key: "wallet",
        label: "Wallet",
      },
      {
        filterable: !txId,
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
              filterable: !txId,
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
    [symbol, txId]
  )

  // TODO this should me a separate component using memory table
  return (
    <>
      {txId && (
        <Box
          sx={{
            marginBottom: 1,
            marginLeft: 1,
            marginTop: 0.5,
          }}
        >
          <FilterChip
            label={`Transaction Id = ${txId}`}
            color={stringToColor("Transaction Id")}
            // onDelete={() => {
            // TODO
            // }}
          />
        </Box>
      )}
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
