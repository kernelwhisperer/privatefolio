import { Box, Stack, TableCell, TableRow, TableRowProps, Tooltip } from "@mui/material"
import { useStore } from "@nanostores/react"
// import TableCell from "@mui/material/Unstable_TableCell2" // TableCell version 2
import React from "react"

import { AssetAvatar } from "../../components/AssetAvatar"
import { Balance } from "../../interfaces"
import { $assetMap } from "../../stores/metadata-store"
import { MonoFont } from "../../theme"
import { formatNumber } from "../../utils/client-utils"

interface BalanceTableRowProps extends TableRowProps {
  balance: Balance
}

export function BalanceTableRow(props: BalanceTableRowProps) {
  const { balance: balanceObj, ...rest } = props
  const { symbol, balance } = balanceObj

  const assetMap = useStore($assetMap)

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
      <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>
        <Stack
          direction="row"
          gap={0.5}
          alignItems="center"
          component="div"
          // justifyContent="flex-end"
        >
          <AssetAvatar src={assetMap[symbol]?.image} alt={symbol} />
          <span>{symbol}</span>
        </Stack>
      </TableCell>

      {/* <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>{}</TableCell> */}
      <TableCell align="right" sx={{ fontFamily: MonoFont }}>
        <Tooltip title={<Box sx={{ fontFamily: MonoFont }}>{balance}</Box>}>
          <span>
            {formatNumber(balance, {
              maximumFractionDigits: 2, // TODO make this configurable
              minimumFractionDigits: 2,
            })}
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
