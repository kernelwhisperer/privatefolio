import { AddRounded, RemoveRounded, SvgIconComponent, TrendingFlat } from "@mui/icons-material"
import { alpha, Avatar, Chip, Stack, TableCell, TableRow, Tooltip } from "@mui/material"
import { green, grey, red } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
import React from "react"
import { AmountBlock } from "src/components/AmountBlock"
import { AssetBlock } from "src/components/AssetBlock"
import { getAssetTicker } from "src/utils/assets-utils"

import { TimestampBlock } from "../../components/TimestampBlock"
import { Truncate } from "../../components/Truncate"
import { AuditLog, AuditLogOperation } from "../../interfaces"
import { PLATFORMS_META } from "../../settings"
import { $assetMetaMap, $platformMetaMap } from "../../stores/metadata-store"
import { TableRowComponentProps } from "../../utils/table-utils"

const redColor = red[400]
const greenColor = green[400]

const OPERATION_COLORS: Partial<Record<AuditLogOperation, string>> = {
  Buy: greenColor,
  Distribution: greenColor,
  Fee: redColor,
  Sell: redColor,
}

const OPERATION_ICONS: Partial<Record<AuditLogOperation, SvgIconComponent>> = {
  Buy: AddRounded,
  Deposit: TrendingFlat,
  Distribution: AddRounded,
  Fee: RemoveRounded,
  Sell: RemoveRounded,
  Withdraw: RemoveRounded,
}

export function AuditLogTableRow(props: TableRowComponentProps<AuditLog>) {
  const { row, relativeTime, headCells, isMobile: _isMobile, isTablet: _isTablet, ...rest } = props
  const { assetId, change, changeN, balance, operation, timestamp, platform, wallet } = row

  const assetMap = useStore($assetMetaMap)
  const platformMetaMap = useStore($platformMetaMap)

  const changeColor = changeN < 0 ? redColor : greenColor

  let color = OPERATION_COLORS[operation] || grey[500]
  let OpIconComponent = OPERATION_ICONS[operation]

  if (operation === "Funding Fee") {
    color = changeColor
    OpIconComponent = changeN < 0 ? RemoveRounded : AddRounded
  }

  const showAssetColumn = headCells.length === 7

  // const { value: open, toggle: toggleOpen } = useBoolean(false)

  return (
    <>
      <TableRow
        hover
        // hover={!open}
        // onClick={toggleOpen}
        // className={open ? "TableRow-open-top" : undefined}
        // sx={(theme) => ({
        // ...(open
        //   ? {
        //       "--mui-palette-TableCell-border": "rgba(0,0,0,0)",
        //       background: "var(--mui-palette-background-default)",
        //     }
        //   : {}),
        // })}
        {...rest}
      >
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
          <Tooltip title={operation}>
            <Chip
              size="small"
              sx={{ background: alpha(color, 0.075) }}
              label={
                <Stack direction="row" gap={0.5} alignItems="center" paddingRight={0.5}>
                  {OpIconComponent && <OpIconComponent sx={{ color, fontSize: "inherit" }} />}
                  <Truncate>{operation}</Truncate>
                </Stack>
              }
            />
          </Tooltip>
        </TableCell>
        <TableCell align="right">
          <AmountBlock
            amount={change}
            showSign
            colorized
            currencyTicker={getAssetTicker(assetId)}
          />
        </TableCell>
        {showAssetColumn && (
          <TableCell>
            <AssetBlock asset={assetId} />
          </TableCell>
        )}
        <TableCell align="right">
          <AmountBlock
            currencyTicker={getAssetTicker(assetId)}
            amount={balance}
            tooltipMessage="Use the 'Compute balances' action to compute these values."
          />
        </TableCell>
      </TableRow>
      {/* {open && (
        <TableRow className={open ? "TableRow-open-bottom" : undefined} sx={{ height: 200 }}>
          <TableCell colSpan={2}>File Import</TableCell>
          <TableCell colSpan={5}>Transaction</TableCell>
        </TableRow>
      )} */}
    </>
  )
}
