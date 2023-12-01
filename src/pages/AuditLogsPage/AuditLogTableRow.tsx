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
// import TableCell from "@mui/material/Unstable_TableCell2" // TableCell version 2
import React from "react"

import { AuditLog } from "../../api/audit-logs-api"
import { AssetAvatar } from "../../components/AssetAvatar"
import { TimestampCell } from "../../components/TimestampCell"
import { Truncate } from "../../components/Truncate"
import { Asset, AuditLogOperation, Exchange } from "../../interfaces"
import { MonoFont } from "../../theme"
import { formatNumber } from "../../utils/client-utils"

interface AuditLogTableRowProps extends TableRowProps {
  assetMap: Record<string, Asset>
  auditLog: AuditLog
  integrationMap: Record<string, Exchange>
  relativeTime: boolean
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
  const { auditLog, assetMap, integrationMap, relativeTime, ...rest } = props
  const { symbol, change, changeN, operation, timestamp, integration, wallet, balance } = auditLog

  const color = OPERATION_COLORS[operation] || grey[500]
  const OpIconComponent = OPERATION_ICONS[operation]

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
        sx={{ color: changeN < 0 ? redColor : greenColor, fontFamily: MonoFont }}
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
      <TableCell align="right" sx={{ fontFamily: MonoFont }}>
        <Tooltip title={<Box sx={{ fontFamily: MonoFont }}>{balance}</Box>}>
          <span>
            {formatNumber(balance, {
              maximumFractionDigits: 2, // TODO make this configurable
              minimumFractionDigits: 2,
              // signDisplay: "always",
            })}
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
