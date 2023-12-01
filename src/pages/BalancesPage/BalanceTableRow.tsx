import { TableCell, TableRow, TableRowProps } from "@mui/material"
// import TableCell from "@mui/material/Unstable_TableCell2" // TableCell version 2
import React from "react"

import { Balance, Exchange } from "../../interfaces"
import { MonoFont } from "../../theme"
import { formatNumber } from "../../utils/client-utils"

interface BalanceTableRowProps extends TableRowProps {
  balance: Balance
  integrationMap: Record<string, Exchange>
  relativeTime: boolean
}

export function BalanceTableRow(props: BalanceTableRowProps) {
  const { balance, integrationMap, relativeTime, ...rest } = props
  const { symbol } = balance

  return (
    <TableRow
      {...rest}
      // sx={(theme) => ({
      //   [theme.breakpoints.down("lg")]: {
      //     display: "flex",
      //     flexWrap: "wrap",
      //     // backgroundColor: theme.palette.secondary.main,
      //   },
      // })}
    >
      <TableCell sx={{ maxWidth: 200, minWidth: 200, width: 200 }}>{symbol}</TableCell>
      {/* <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>{}</TableCell> */}
      <TableCell
        sx={{ fontFamily: MonoFont, maxWidth: 140, minWidth: 140, width: 140 }}
        align="right"
      >
        {formatNumber(balance.balance)}
      </TableCell>
    </TableRow>
  )
}
