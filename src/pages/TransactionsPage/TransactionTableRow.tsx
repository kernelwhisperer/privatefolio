import {
  AddRounded,
  RemoveRounded,
  SvgIconComponent,
  SwapHoriz,
  Visibility,
} from "@mui/icons-material"
import { alpha, Avatar, Chip, IconButton, Stack, TableCell, TableRow, Tooltip } from "@mui/material"
import { grey } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
import React from "react"
import { AmountBlock } from "src/components/AmountBlock"
import { AssetBlock } from "src/components/AssetBlock"
import { useBoolean } from "src/hooks/useBoolean"
import { PLATFORMS_META } from "src/settings"
import { getAssetTicker } from "src/utils/assets-utils"
import { greenColor, redColor } from "src/utils/color-utils"

import { TimestampBlock } from "../../components/TimestampBlock"
import { Truncate } from "../../components/Truncate"
import { Transaction, TransactionType } from "../../interfaces"
import { $platformMetaMap } from "../../stores/metadata-store"
import { TableRowComponentProps } from "../../utils/table-utils"
import { TransactionDrawer } from "./TransactionDrawer"

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
  const {
    row,
    relativeTime,
    headCells: _headCells,
    isMobile: _isMobile,
    isTablet: _isTablet,
    ...rest
  } = props

  const {
    incoming,
    incomingAsset,
    type,
    timestamp,
    platform,
    wallet,
    outgoing,
    outgoingAsset,
    fee,
    feeAsset,
  } = row

  const platformMetaMap = useStore($platformMetaMap)

  const color = OPERATION_COLORS[type] || grey[500]
  const TypeIconComponent = OPERATION_ICONS[type]

  const { value: open, toggle: toggleOpen } = useBoolean(false)

  return (
    <>
      <TableRow hover {...rest}>
        <TableCell>
          <TimestampBlock timestamp={timestamp} relative={relativeTime} />
        </TableCell>
        <TableCell>
          <Stack direction="row" gap={0.5} alignItems="center" component="div">
            <Avatar
              src={platformMetaMap[platform]?.image}
              sx={{
                borderRadius: "2px",
                height: 16,
                width: 16,
              }}
              alt={PLATFORMS_META[platform].name}
            />
            {/* <span>{PLATFORMS_META[platform].name}</span> */}
          </Stack>
        </TableCell>
        <TableCell>
          <Tooltip title={wallet}>
            <Truncate>{wallet}</Truncate>
          </Tooltip>
        </TableCell>
        <TableCell>
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
        <TableCell align="right">
          <AmountBlock
            colorized
            placeholder=""
            amount={outgoing ? `-${outgoing}` : 0}
            showSign
            currencyTicker={getAssetTicker(outgoingAsset || (incomingAsset as string))}
          />
        </TableCell>
        <TableCell>
          <AssetBlock asset={outgoingAsset || (incomingAsset as string)} />
        </TableCell>
        <TableCell align="right">
          <AmountBlock
            colorized
            placeholder=""
            amount={incoming || 0}
            showSign
            currencyTicker={getAssetTicker(incomingAsset || (outgoingAsset as string))}
          />
        </TableCell>
        <TableCell>
          <AssetBlock asset={incomingAsset || (outgoingAsset as string)} />
        </TableCell>
        <TableCell align="right">
          <AmountBlock
            colorized
            placeholder=""
            amount={fee || 0}
            showSign
            currencyTicker={getAssetTicker(feeAsset || incomingAsset || (outgoingAsset as string))}
          />
        </TableCell>
        <TableCell>
          <AssetBlock asset={feeAsset || incomingAsset || (outgoingAsset as string)} />
        </TableCell>
        <TableCell>
          <Tooltip title="Inspect">
            <IconButton
              size="small"
              color="secondary"
              sx={{
                ".MuiTableRow-root:hover &": {
                  visibility: "visible",
                },
                height: 28,
                marginLeft: -1,
                marginY: -0.25,
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
