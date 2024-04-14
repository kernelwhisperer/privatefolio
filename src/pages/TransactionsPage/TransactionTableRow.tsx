import { SwapHoriz, Visibility } from "@mui/icons-material"
import { IconButton, Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { ActionBlock } from "src/components/ActionBlock"
import { AssetAmountBlock } from "src/components/AssetAmountBlock"
import { AssetBlock } from "src/components/AssetBlock"
import { PlatformBlock } from "src/components/PlatformBlock"
import { useBoolean } from "src/hooks/useBoolean"
import { $activeAccount } from "src/stores/account-store"
import { clancy } from "src/workers/remotes"

import { TimestampBlock } from "../../components/TimestampBlock"
import { Truncate } from "../../components/Truncate"
import { ChartData, Transaction } from "../../interfaces"
import { TableRowComponentProps } from "../../utils/table-utils"
import { TransactionDrawer } from "./TransactionDrawer"

export function TransactionTableRow(props: TableRowComponentProps<Transaction>) {
  const { row, relativeTime, headCells, isMobile: _isMobile, isTablet, ...rest } = props

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

  const { value: open, toggle: toggleOpen } = useBoolean(false)

  const [priceMap, setPriceMap] = useState<Record<string, ChartData>>()

  useEffect(() => {
    clancy.getAssetPriceMap($activeAccount.get(), timestamp).then((priceMap) => {
      setPriceMap(priceMap)
    })
  }, [open, timestamp])

  if (isTablet) {
    return (
      <>
        <TableRow hover>
          <TableCell colSpan={headCells.length} onClick={toggleOpen} sx={{ cursor: "pointer" }}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                <TimestampBlock timestamp={timestamp} relative={relativeTime} />
              </Typography>
              <Stack
                direction="row"
                gap={1}
                marginY={0.5}
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
              >
                <ActionBlock action={type} />
                <Stack
                  direction="row"
                  gap={1}
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  // flexGrow={outgoing && incoming ? 1 : 0}
                >
                  {outgoing && (
                    <Stack direction="row" gap={1} alignItems="center">
                      <AssetAmountBlock
                        assetId={outgoingAsset}
                        amount={outgoing ? `-${outgoing}` : undefined}
                        priceMap={priceMap}
                        colorized
                        showSign
                        placeholder=""
                      />
                      <AssetBlock asset={outgoingAsset} />
                    </Stack>
                  )}
                  {outgoing && incoming ? (
                    <SwapHoriz fontSize="small" color="secondary" sx={{ marginX: 2 }} />
                  ) : null}
                  {incoming && (
                    <Stack direction="row" gap={1} alignItems="center">
                      <AssetAmountBlock
                        assetId={incomingAsset}
                        amount={incoming}
                        priceMap={priceMap}
                        colorized
                        showSign
                        placeholder=""
                      />
                      <AssetBlock asset={incomingAsset} />
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </TableCell>
        </TableRow>
        <TransactionDrawer
          key={row._id}
          open={open}
          toggleOpen={toggleOpen}
          tx={row}
          relativeTime={relativeTime}
          priceMap={priceMap}
        />
      </>
    )
  }

  return (
    <>
      <TableRow hover {...rest}>
        <TableCell>
          <TimestampBlock timestamp={timestamp} relative={relativeTime} />
        </TableCell>
        <TableCell>
          <PlatformBlock platform={platform} hideName />
        </TableCell>
        <TableCell>
          <Tooltip title={wallet}>
            <Truncate>{wallet}</Truncate>
          </Tooltip>
        </TableCell>
        <TableCell>
          <ActionBlock action={type} />
        </TableCell>
        <TableCell align="right" variant="clickable">
          <AssetAmountBlock
            assetId={outgoingAsset}
            amount={outgoing ? `-${outgoing}` : undefined}
            priceMap={priceMap}
            colorized
            showSign
            placeholder=""
          />
        </TableCell>
        <TableCell>
          <AssetBlock asset={outgoingAsset} />
        </TableCell>
        <TableCell align="right" variant="clickable">
          <AssetAmountBlock
            assetId={incomingAsset}
            amount={incoming}
            priceMap={priceMap}
            colorized
            showSign
            placeholder=""
          />
        </TableCell>
        <TableCell>
          <AssetBlock asset={incomingAsset} />
        </TableCell>
        <TableCell align="right" variant="clickable">
          <AssetAmountBlock
            assetId={feeAsset}
            amount={fee}
            priceMap={priceMap}
            colorized
            showSign
            placeholder=""
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
        priceMap={priceMap}
      />
    </>
  )
}
