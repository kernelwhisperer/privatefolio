import { AddRounded, RemoveRounded, SvgIconComponent, SwapHoriz } from "@mui/icons-material"
import { alpha, Avatar, Box, Chip, Stack, TableCell, TableRow, Tooltip } from "@mui/material"
import { green, grey, red } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
// import TableCell from "@mui/material/Unstable_TableCell2" // TableCell version 2
import React from "react"

import { AssetAvatar } from "../../components/AssetAvatar"
import { TableRowComponentProps } from "../../components/RemoteTable/RemoteTable"
import { TimestampCell } from "../../components/TimestampCell"
import { Truncate } from "../../components/Truncate"
import { Transaction, TransactionType } from "../../interfaces"
import { $assetMap, $integrationMap } from "../../stores/metadata-store"
import { MonoFont } from "../../theme"
import { formatNumber } from "../../utils/client-utils"

const redColor = red[400]
const greenColor = green[400]

const OPERATION_COLORS: Partial<Record<TransactionType, string>> = {
  Buy: greenColor,
  Sell: redColor,
}

const OPERATION_ICONS: Partial<Record<TransactionType, SvgIconComponent>> = {
  Buy: AddRounded,
  Sell: RemoveRounded,
  Swap: SwapHoriz,
}

export function TransactionTableRow(props: TableRowComponentProps<Transaction>) {
  const { relativeTime, row } = props
  const { symbol, amountN, type, timestamp, integration, wallet, quoteSymbol, totalN } = row

  const assetMap = useStore($assetMap)
  const integrationMap = useStore($integrationMap)

  const color = OPERATION_COLORS[type] || grey[500]
  const TypeIconComponent = OPERATION_ICONS[type]

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ maxWidth: 200, minWidth: 200, width: 200 }}>
          <TimestampCell timestamp={timestamp} relative={relativeTime} />
        </TableCell>
        <TableCell sx={{ maxWidth: 160, minWidth: 160, width: 140 }}>
          <Stack direction="row" gap={0.5} alignItems="center" component="div">
            <Avatar
              src={integrationMap[integration]?.image}
              sx={{
                borderRadius: "2px",
                height: 16,
                width: 16,
              }}
              alt={symbol}
            />
            <span>{integration}</span>
          </Stack>
        </TableCell>
        <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>{wallet}</TableCell>
        <TableCell sx={{ maxWidth: 120, minWidth: 120, width: 120 }}>
          <Tooltip title={type}>
            <Chip
              size="small"
              sx={{ background: alpha(color, 0.075) }}
              label={
                <Stack direction="row" gap={0.5} alignItems="center" paddingRight={0.5}>
                  {TypeIconComponent && <TypeIconComponent sx={{ color, fontSize: "inherit" }} />}
                  <Truncate>{type}</Truncate>
                </Stack>
              }
            />
          </Tooltip>
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: redColor,
            fontFamily: MonoFont,
            //
            maxWidth: 140,
            minWidth: 140,
            width: 140,
          }}
        >
          <Tooltip title={<Box sx={{ fontFamily: MonoFont }}>{amountN}</Box>}>
            <span>
              {formatNumber(amountN * -1, {
                maximumFractionDigits: 2, // TODO make this configurable
                minimumFractionDigits: 2,
                signDisplay: "always",
              })}
            </span>
          </Tooltip>
        </TableCell>
        <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>
          <Stack direction="row" gap={0.5} alignItems="center" component="div">
            <AssetAvatar size="small" src={assetMap[symbol]?.image} alt={symbol} />
            <span>{symbol}</span>
          </Stack>
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: greenColor,
            fontFamily: MonoFont,
            //
            maxWidth: 140,
            minWidth: 140,
            width: 140,
          }}
        >
          <Tooltip title={<Box sx={{ fontFamily: MonoFont }}>{amountN}</Box>}>
            <span>
              {formatNumber(totalN, {
                maximumFractionDigits: 2, // TODO make this configurable
                minimumFractionDigits: 2,
                signDisplay: "always",
              })}
            </span>
          </Tooltip>
        </TableCell>
        <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>
          <Stack direction="row" gap={0.5} alignItems="center" component="div">
            <AssetAvatar size="small" src={assetMap[quoteSymbol]?.image} alt={symbol} />
            <span>{quoteSymbol}</span>
          </Stack>
        </TableCell>
      </TableRow>
    </>
  )
}
