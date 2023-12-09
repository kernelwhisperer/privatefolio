import { AddRounded, RemoveRounded, SvgIconComponent } from "@mui/icons-material"
import {
  alpha,
  Avatar,
  Box,
  Chip,
  Stack,
  TableCell,
  TableRow,
  TableRowProps,
  Tooltip,
} from "@mui/material"
import { green, grey, red } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
// import TableCell from "@mui/material/Unstable_TableCell2" // TableCell version 2
import React from "react"

import { AssetAvatar } from "../../components/AssetAvatar"
import { TimestampCell } from "../../components/TimestampCell"
import { Truncate } from "../../components/Truncate"
import { useBoolean } from "../../hooks/useBoolean"
import { AuditLog, AuditLogOperation } from "../../interfaces"
import { $assetMap, $integrationMap } from "../../stores/metadata-store"
import { MonoFont } from "../../theme"
import { formatNumber } from "../../utils/client-utils"

interface AuditLogTableRowProps extends TableRowProps {
  auditLog: AuditLog
  relativeTime: boolean
  symbol?: string
}

const redColor = red[400]
const greenColor = green[400]

const OPERATION_COLORS: Partial<Record<AuditLogOperation, string>> = {
  Buy: greenColor,
  Distribution: greenColor,
  Fee: redColor,
  "Funding Fee": greenColor,
  Sell: redColor,
}

const OPERATION_ICONS: Partial<Record<AuditLogOperation, SvgIconComponent>> = {
  Buy: AddRounded,
  Deposit: AddRounded,
  Distribution: AddRounded,
  Fee: RemoveRounded,
  "Funding Fee": RemoveRounded,
  Sell: RemoveRounded,
  Withdraw: RemoveRounded,
}

export function AuditLogTableRow(props: AuditLogTableRowProps) {
  const { auditLog, relativeTime, symbol: predefinedSymbol, ...rest } = props
  const { symbol, change, changeN, operation, timestamp, integration, wallet, balance } = auditLog

  const assetMap = useStore($assetMap)
  const integrationMap = useStore($integrationMap)

  const color = OPERATION_COLORS[operation] || grey[500]
  const OpIconComponent = OPERATION_ICONS[operation]

  const { value: open, toggle: toggleOpen } = useBoolean(false)

  return (
    <>
      <TableRow
        hover={!open}
        onClick={toggleOpen}
        className={open ? "TableRow-open-top" : undefined}
        sx={() => ({
          // ...(open
          //   ? {
          //       "--mui-palette-TableCell-border": "rgba(0,0,0,0)",
          //       background: "var(--mui-palette-background-default)",
          //     }
          //   : {}),
          // [theme.breakpoints.down("lg")]: {
          //   display: "flex",
          //   flexWrap: "wrap",
          //   // backgroundColor: theme.palette.secondary.main,
          // },
        })}
        {...rest}
      >
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
        <TableCell sx={{ maxWidth: 220, minWidth: 220, width: 220 }}>
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
        <TableCell
          align="right"
          sx={{
            color: changeN < 0 ? redColor : greenColor,
            fontFamily: MonoFont,
            //
            maxWidth: 140,
            minWidth: 140,
            width: 140,
          }}
        >
          <Tooltip title={<Box sx={{ fontFamily: MonoFont }}>{change}</Box>}>
            <span>
              {formatNumber(changeN, {
                maximumFractionDigits: 2, // TODO make this configurable
                minimumFractionDigits: 2,
                signDisplay: "always",
              })}
            </span>
          </Tooltip>
        </TableCell>
        {!predefinedSymbol && (
          <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>
            <Stack
              direction="row"
              gap={0.5}
              alignItems="center"
              component="div"
              // justifyContent="flex-end"
            >
              <AssetAvatar size="small" src={assetMap[symbol]?.image} alt={symbol} />
              <span>{symbol}</span>
            </Stack>
          </TableCell>
        )}
        <TableCell align="right" sx={{ fontFamily: MonoFont }}>
          <Tooltip
            title={
              <Box sx={{ fontFamily: MonoFont }}>
                {typeof balance === "number" ? balance : "To be determined"}
              </Box>
            }
          >
            <span>
              {typeof balance === "number"
                ? formatNumber(balance, {
                    maximumFractionDigits: 2, // TODO make this configurable
                    minimumFractionDigits: 2,
                  })
                : "Tbd"}
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className={open ? "TableRow-open-bottom" : undefined} sx={{ height: 200 }}>
          <TableCell colSpan={2}>File Import</TableCell>
          <TableCell colSpan={5}>Transaction</TableCell>
        </TableRow>
      )}
    </>
  )
}