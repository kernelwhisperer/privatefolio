import { Box, Stack, TableCell, TableRow, Tooltip } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { useNavigate } from "react-router-dom"

import { AssetAvatar } from "../../components/AssetAvatar"
import { Balance } from "../../interfaces"
import { $assetMap } from "../../stores/metadata-store"
import { MonoFont } from "../../theme"
import { formatNumber } from "../../utils/client-utils"
import { TableRowComponentProps } from "../../utils/table-utils"

export function BalanceTableRow(props: TableRowComponentProps<Balance>) {
  const { row, headCells: _headCells, relativeTime: _relativeTime, ...rest } = props
  const { symbol, balance, price } = row
  const navigate = useNavigate()

  const assetMap = useStore($assetMap)

  return (
    <TableRow
      sx={{ cursor: "pointer" }}
      onClick={() => {
        navigate(`/asset/${symbol}`)
      }}
      {...rest}
    >
      <TableCell sx={{ maxWidth: 260, minWidth: 260, width: 260 }}>
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          component="div"
          // justifyContent="flex-end"
        >
          <AssetAvatar src={assetMap[symbol]?.image} alt={symbol} size="small" />
          <Stack>
            <span>{symbol}</span>
          </Stack>
        </Stack>
      </TableCell>
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
      <TableCell align="right" sx={{ fontFamily: MonoFont }}>
        <Tooltip title={<Box sx={{ fontFamily: MonoFont }}>{price?.value}</Box>}>
          <span>
            {formatNumber(price?.value || 0, {
              maximumFractionDigits: 2, // TODO make this configurable
              minimumFractionDigits: 2,
            })}
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
