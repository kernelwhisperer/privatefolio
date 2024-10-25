import { AddRounded, RemoveRounded, Visibility } from "@mui/icons-material"
import { IconButton, Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { ActionBlock } from "src/components/ActionBlock"
import { AssetAmountBlock } from "src/components/AssetAmountBlock"
import { AssetBlock } from "src/components/AssetBlock"
import { PlatformBlock } from "src/components/PlatformBlock"
import { useBoolean } from "src/hooks/useBoolean"
import { $activeAccount } from "src/stores/account-store"
import { greenColor, redColor } from "src/utils/color-utils"
import { clancy } from "src/workers/remotes"

import { TimestampBlock } from "../../components/TimestampBlock"
import { Truncate } from "../../components/Truncate"
import { AuditLog, ChartData } from "../../interfaces"
import { TableRowComponentProps } from "../../utils/table-utils"
import { AuditLogDrawer } from "./AuditLogDrawer"

export function AuditLogTableRow(props: TableRowComponentProps<AuditLog>) {
  const { row, relativeTime, headCells, isMobile: _isMobile, isTablet, ...rest } = props
  const { assetId, change, changeN, balance, operation, timestamp, platform, wallet } = row

  const changeColor = changeN < 0 ? redColor : greenColor

  const showAssetColumn = headCells.length === 8

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
        <TableRow hover {...rest}>
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
              >
                {operation === "Funding Fee" ? (
                  <ActionBlock
                    action={operation}
                    color={changeColor as any} // FIXME
                    size="medium"
                    IconComponent={changeN < 0 ? RemoveRounded : AddRounded}
                  />
                ) : (
                  <ActionBlock action={operation} />
                )}
                <Stack direction="row" gap={1} alignItems="center">
                  <AssetAmountBlock
                    assetId={assetId}
                    amount={change}
                    priceMap={priceMap}
                    colorized
                    showSign
                  />
                  {showAssetColumn && <AssetBlock asset={assetId} showPlatform />}
                </Stack>
              </Stack>
            </Stack>
          </TableCell>
        </TableRow>
        <AuditLogDrawer
          key={row._id}
          open={open}
          toggleOpen={toggleOpen}
          auditLog={row}
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
          {operation === "Funding Fee" ? (
            <ActionBlock
              action={operation}
              color={changeColor as any} // FIXME
              IconComponent={changeN < 0 ? RemoveRounded : AddRounded}
            />
          ) : (
            <ActionBlock action={operation} />
          )}
        </TableCell>
        <TableCell align="right" variant="clickable">
          <AssetAmountBlock
            assetId={assetId}
            amount={change}
            priceMap={priceMap}
            colorized
            showSign
          />
        </TableCell>
        {showAssetColumn && (
          <TableCell>
            <AssetBlock asset={assetId} showPlatform />
          </TableCell>
        )}
        <TableCell align="right">
          <AssetAmountBlock
            assetId={assetId}
            amount={balance}
            priceMap={priceMap}
            tooltipMessage="Use the 'Compute balances' action to compute these values."
          />
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
      <AuditLogDrawer
        key={row._id}
        open={open}
        toggleOpen={toggleOpen}
        auditLog={row}
        relativeTime={relativeTime}
        priceMap={priceMap}
      />
    </>
  )
}
