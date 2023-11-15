import { AddRounded } from "@mui/icons-material"
import { Chip, Grid, Stack, Typography } from "@mui/material"
import { green } from "@mui/material/colors"
// import Grid from "@mui/material/Unstable_Grid2" // Grid version 2
import React from "react"

import { AssetAvatar } from "../../../components/AssetAvatar"
import { Asset, AuditLog } from "../../../interfaces"
import { RobotoMonoFF } from "../../../theme"
import { formatDate, formatHour } from "../../../utils/client-utils"

const COLUMN_GAP = 1

interface AuditLogCardProps {
  assetMap: Record<string, Asset>
  auditLog: AuditLog
}

const color = green[500]

export function DefaultAuditLogCard(props: AuditLogCardProps) {
  const { auditLog, assetMap } = props
  const { symbol, id, change, operation, timestamp, integration, wallet } = auditLog

  return (
    <>
      <Typography component="div" variant="body2" fontFamily={RobotoMonoFF}>
        <>
          <Grid container spacing={2} paddingY={1} paddingX={2}>
            <Grid item xs={12} lg={2.5}>
              <span>
                <span>{formatDate(timestamp)}</span>{" "}
                <Typography component="span" color="text.secondary" variant="body2">
                  at {formatHour(timestamp)}
                </Typography>
              </span>
            </Grid>
            <Grid item xs={12} lg={2}>
              <Chip
                size="small"
                label={
                  <Typography variant="body2" component="div">
                    <Stack direction="row" gap={0.5} alignItems="center" paddingRight={0.5}>
                      {/* <SwapHorizRounded fontSize="small" /> */}
                      <AddRounded sx={{ fontSize: "inherit" }} />
                      <span>{operation}</span>
                      {/* <span>Trade</span> */}
                    </Stack>
                  </Typography>
                }
                sx={{
                  //  background: alpha(color, 0.2),
                  // color,
                  letterSpacing: 0.5,
                }}
              />
            </Grid>
            <Grid item xs={12} lg={1}>
              {integration}
            </Grid>
            <Grid item xs={12} lg={1}>
              {wallet}
            </Grid>
            <Grid item xs={12} lg={2}>
              <Typography variant="inherit" style={{ textAlign: "right" }}>
                {change}
                {/* {formatUsdc(parseInt(row.amount) / 10 ** row.asset.token.decimals, 0, "standard")}{" "} */}
              </Typography>
            </Grid>
            <Grid item xs={12} lg={2}>
              <Stack direction="row" gap={0.5} alignItems="center" component="div">
                <AssetAvatar
                  sx={{ height: 16, width: 16 }}
                  src={assetMap[symbol]?.image}
                  alt={symbol}
                >
                  {symbol}
                </AssetAvatar>
                <span>{symbol}</span>
              </Stack>
            </Grid>
            <Grid item xs={12} lg={1}>
              <Typography variant="inherit" style={{ textAlign: "right" }}>
                {change}
                {/* {formatUsdc(parseInt(row.amount) / 10 ** row.asset.token.decimals, 0, "standard")}{" "} */}
              </Typography>
            </Grid>
          </Grid>
        </>
      </Typography>
    </>
  )
}
