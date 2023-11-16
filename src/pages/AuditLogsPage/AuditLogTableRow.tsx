import { AddRounded, RemoveRounded, SvgIconComponent } from "@mui/icons-material"
import {
  alpha,
  Avatar,
  Chip,
  Stack,
  TableCell,
  TableRow,
  TableRowProps,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { green, grey, red } from "@mui/material/colors"
// import TableCell from "@mui/material/Unstable_TableCell2" // TableCell version 2
import React from "react"

import { AssetAvatar } from "../../components/AssetAvatar"
import { Truncate } from "../../components/Truncate"
import { Asset, AuditLog, AuditLogOperation, Exchange } from "../../interfaces"
import { MainFont, MonoFont } from "../../theme"
import { formatDate, formatHour, formatNumber } from "../../utils/client-utils"

interface AuditLogTableRowProps extends TableRowProps {
  assetMap: Record<string, Asset>
  auditLog: AuditLog
  integrationMap: Record<string, Exchange>
}

const OPERATION_COLORS: Partial<Record<AuditLogOperation, string>> = {
  Buy: green[400],
  Distribution: green[400],
  Fee: red[400],
  "Funding Fee": red[400],
  Sell: red[400],
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
  const { auditLog, assetMap, integrationMap, ...rest } = props
  const { symbol, id, change, operation, changeBN, timestamp, integration, wallet } = auditLog

  const color = OPERATION_COLORS[operation] || grey[500]
  const OpIconComponent = OPERATION_ICONS[operation]

  const mobile = useMediaQuery((theme: any) => theme.breakpoints.down("md"))
  console.log("📜 LOG > AuditLogTableRow > mobile:", mobile)
  // const mobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <TableRow {...rest}>
      <TableCell sx={{ maxWidth: 200, minWidth: 200, width: 200 }}>
        <span>{formatDate(timestamp)}</span>{" "}
        <Typography component="span" color="text.secondary" variant="inherit">
          at {formatHour(timestamp)}
        </Typography>
      </TableCell>
      <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>
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
        <Chip
          size="small"
          color="primary"
          label={
            <Stack direction="row" gap={0.5} alignItems="center" paddingRight={0.5}>
              {OpIconComponent && <OpIconComponent sx={{ color, fontSize: "inherit" }} />}
              <Truncate>{operation}</Truncate>
            </Stack>
          }
          sx={{
            background: alpha(color, 0.075),
            color: "text.secondary",
            fontFamily: MainFont,
            letterSpacing: 0.5,
          }}
        />
      </TableCell>
      <TableCell align="right" sx={{ color, fontFamily: MonoFont }}>
        {formatNumber(changeBN.toNumber())}
      </TableCell>
      <TableCell sx={{ maxWidth: 140, minWidth: 140, width: 140 }}>
        <Stack
          direction="row"
          gap={0.5}
          alignItems="center"
          component="div"
          // justifyContent="flex-end"
        >
          <AssetAvatar
            sx={{
              // background: alpha(grey[500], 0.075),
              height: 16,
              width: 16,
            }}
            src={assetMap[symbol]?.image}
            alt={symbol}
          >
            {symbol.slice(0, 1)}
          </AssetAvatar>
          <span>{symbol}</span>
        </Stack>
      </TableCell>
    </TableRow>
  )
}
