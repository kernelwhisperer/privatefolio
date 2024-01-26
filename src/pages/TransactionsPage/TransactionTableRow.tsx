import {
  AddRounded,
  RemoveRounded,
  SvgIconComponent,
  SwapHoriz,
  Visibility,
} from "@mui/icons-material"
import { alpha, Avatar, Chip, IconButton, Stack, TableCell, TableRow, Tooltip } from "@mui/material"
import { green, grey, red } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
import React from "react"
import { AmountBlock } from "src/components/AmountBlock"
import { useBoolean } from "src/hooks/useBoolean"

import { AssetAvatar } from "../../components/AssetAvatar"
import { TimestampBlock } from "../../components/TimestampBlock"
import { Truncate } from "../../components/Truncate"
import { Transaction, TransactionType } from "../../interfaces"
import { INTEGRATIONS } from "../../settings"
import { $assetMap, $integrationMap } from "../../stores/metadata-store"
import { TableRowComponentProps } from "../../utils/table-utils"
import { TransactionDrawer } from "./TransactionDrawer"

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
  const { relativeTime, isMobile: _isMobile, isTablet: _isTablet, row } = props
  const {
    incomingN,
    incomingSymbol,
    type,
    timestamp,
    integration,
    wallet,
    outgoingN,
    outgoingSymbol,
  } = row

  const assetMap = useStore($assetMap)
  const integrationMap = useStore($integrationMap)

  const color = OPERATION_COLORS[type] || grey[500]
  const TypeIconComponent = OPERATION_ICONS[type]

  const { value: open, toggle: toggleOpen } = useBoolean(false)

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ maxWidth: 200, minWidth: 200, width: 200 }}>
          <TimestampBlock timestamp={timestamp} relative={relativeTime} />
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
              alt={INTEGRATIONS[integration]}
            />
            <span>{INTEGRATIONS[integration]}</span>
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
            //
            maxWidth: 120,
            minWidth: 120,
            width: 120,
          }}
        >
          <AmountBlock
            amount={outgoingN ? outgoingN * -1 : outgoingN}
            formatOpts={{ signDisplay: "always" }}
          />
        </TableCell>
        <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>
          {outgoingSymbol && (
            <Stack direction="row" gap={0.5} alignItems="center" component="div">
              <AssetAvatar
                size="small"
                src={assetMap[outgoingSymbol]?.image}
                alt={outgoingSymbol}
              />
              <span>{outgoingSymbol}</span>
            </Stack>
          )}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: greenColor,
            //
            maxWidth: 120,
            minWidth: 120,
            width: 120,
          }}
        >
          <AmountBlock amount={incomingN} formatOpts={{ signDisplay: "always" }} />
        </TableCell>
        <TableCell sx={{ maxWidth: 120, minWidth: 120, width: 120 }}>
          {incomingSymbol && (
            <Stack direction="row" gap={0.5} alignItems="center" component="div">
              <AssetAvatar
                size="small"
                src={assetMap[incomingSymbol]?.image}
                alt={incomingSymbol}
              />
              <span>{incomingSymbol}</span>
            </Stack>
          )}
        </TableCell>
        <TableCell sx={{ maxWidth: 40, minWidth: 40, width: 40 }}>
          <Tooltip title="Inspect transaction">
            <IconButton
              size="small"
              color="secondary"
              sx={{
                ".MuiTableRow-root:hover &": {
                  visibility: "visible",
                },
                height: 28,
                marginLeft: -1,
                visibility: "hidden",
              }}
              onClick={toggleOpen}
            >
              <Visibility fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TransactionDrawer
        key={row._id}
        open={open}
        toggleOpen={toggleOpen}
        tx={row}
        relativeTime={relativeTime}
      />
    </>
  )
}
