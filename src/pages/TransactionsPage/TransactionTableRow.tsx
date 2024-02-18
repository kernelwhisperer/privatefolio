import { Visibility } from "@mui/icons-material"
import { Avatar, IconButton, Stack, TableCell, TableRow, Tooltip } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { ActionBlock } from "src/components/ActionBlock"
import { AmountBlock } from "src/components/AmountBlock"
import { AssetBlock } from "src/components/AssetBlock"
import { useBoolean } from "src/hooks/useBoolean"
import { PLATFORMS_META } from "src/settings"
import { getAssetTicker } from "src/utils/assets-utils"

import { TimestampBlock } from "../../components/TimestampBlock"
import { Truncate } from "../../components/Truncate"
import { Transaction } from "../../interfaces"
import { $platformMetaMap } from "../../stores/metadata-store"
import { TableRowComponentProps } from "../../utils/table-utils"
import { TransactionDrawer } from "./TransactionDrawer"

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
          <ActionBlock action={type} />
        </TableCell>
        <TableCell align="right">
          <AmountBlock
            colorized
            placeholder=""
            amount={outgoing ? `-${outgoing}` : undefined}
            showSign
            currencyTicker={getAssetTicker(outgoingAsset)}
          />
        </TableCell>
        <TableCell>
          <AssetBlock asset={outgoingAsset} />
        </TableCell>
        <TableCell align="right">
          <AmountBlock
            colorized
            placeholder=""
            amount={incoming}
            showSign
            currencyTicker={getAssetTicker(incomingAsset)}
          />
        </TableCell>
        <TableCell>
          <AssetBlock asset={incomingAsset} />
        </TableCell>
        <TableCell align="right">
          <AmountBlock
            colorized
            placeholder=""
            amount={fee}
            showSign
            currencyTicker={getAssetTicker(feeAsset)}
          />
        </TableCell>
        <TableCell>
          <AssetBlock asset={feeAsset} />
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
