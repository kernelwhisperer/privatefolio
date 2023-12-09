import { Stack, Typography } from "@mui/material"
import MuiTablePagination, {
  tablePaginationClasses,
  TablePaginationProps,
} from "@mui/material/TablePagination"
import React from "react"

import { QueryTimer } from "./QueryTimer"
import { TablePaginationActions } from "./TableActions"

type TableFooterProps = TablePaginationProps & {
  queryTime?: number | null
}

export function TableFooter(props: TableFooterProps) {
  const { queryTime, ...rest } = props

  return (
    <Stack
      direction="row"
      sx={{
        background: "var(--mui-palette-background-paper)",
        borderTop: "1px solid var(--mui-palette-TableCell-border)",
        bottom: 0,
        position: "sticky",
      }}
      justifyContent="space-between"
      alignItems="center"
    >
      {queryTime !== undefined && <QueryTimer queryTime={queryTime} />}
      <MuiTablePagination
        component="div"
        sx={{
          border: 0,
          width: "100%",
          [`& .${tablePaginationClasses.spacer}`]: {
            flexBasis: 0,
            flexGrow: 0,
          },
          [`& .${tablePaginationClasses.input}`]: {
            marginRight: "auto",
          },
          [`& .${tablePaginationClasses.toolbar}`]: {
            paddingLeft: 0,
          },
          [`& .${tablePaginationClasses.select}, & .${tablePaginationClasses.selectIcon}`]: {
            color: "var(--mui-palette-text-secondary)",
          },
          [`& .${tablePaginationClasses.select}`]: {
            borderRadius: "8px !important",
          },
          [`& .${tablePaginationClasses.select}:hover`]: {
            background: "rgba(var(--mui-palette-common-onBackgroundChannel) / 0.05)",
          },
        }}
        labelRowsPerPage=""
        labelDisplayedRows={({ from, to, count }) => (
          <>
            {from}-{to}{" "}
            <Typography variant="body2" component="span" color="text.secondary">
              of {count}
            </Typography>
          </>
        )}
        slotProps={{
          select: {
            renderValue: (value) => `${value} rows per page`,
          },
        }}
        ActionsComponent={TablePaginationActions}
        {...rest}
      />
    </Stack>
  )
}
