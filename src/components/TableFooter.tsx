import { TimerSharp } from "@mui/icons-material"
import { CircularProgress, Skeleton, Stack, Tooltip, Typography } from "@mui/material"
import MuiTablePagination, {
  tablePaginationClasses,
  TablePaginationProps,
} from "@mui/material/TablePagination"
import React from "react"

import { MonoFont } from "../theme"
import { formatNumber } from "../utils/client-utils"
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
      {queryTime !== undefined && (
        <Tooltip
          title={null}
          // title={
          //   queryTime ? (
          //     <Stack>
          //       <span>Fetch query time: 0.1s</span>
          //       <span>Count query time: 0.1s</span>
          //       <Typography color={grey[400]} component="i" variant="inherit">
          //         these operations can take a long time because they are read from the
          //         disk
          //       </Typography>
          //     </Stack>
          //   ) : null
          // }
        >
          <Typography
            variant="caption"
            color="text.secondary"
            component={Stack}
            padding={1.5}
            sx={{ minWidth: 100 }}
            fontFamily={MonoFont}
            direction="row"
            gap={1}
            marginBottom={0.25}
          >
            {queryTime === null ? (
              <>
                <CircularProgress size={14} color="inherit" sx={{ margin: "3px" }} />
                <Skeleton sx={{ flexGrow: 1 }}></Skeleton>
              </>
            ) : (
              <>
                <TimerSharp fontSize="small" />
                <span>
                  {formatNumber(queryTime / 1000, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}
                  s
                </span>
              </>
            )}
          </Typography>
        </Tooltip>
      )}
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
            borderRadius: 1,
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
