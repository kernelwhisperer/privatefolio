import { Box, Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { useNavigate } from "react-router-dom"

import { AssetAvatar } from "../../components/AssetAvatar"
import { Balance } from "../../interfaces"
import { $assetMap } from "../../stores/metadata-store"
import { MonoFont } from "../../theme"
import { formatNumber } from "../../utils/formatting-utils"
import { TableRowComponentProps } from "../../utils/table-utils"

export function BalanceTableRow(props: TableRowComponentProps<Balance>) {
  const { row, headCells: _headCells, relativeTime: _relativeTime, ...rest } = props
  const { symbol, balance, price, value } = row
  const navigate = useNavigate()

  const assetMap = useStore($assetMap)

  return (
    <TableRow
      sx={{ cursor: "pointer" }}
      hover
      onClick={() => {
        navigate(`/asset/${symbol}`)
      }}
      {...rest}
    >
      <TableCell sx={{ maxWidth: 380, minWidth: 380, width: 380 }}>
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          component="div"
          // justifyContent="flex-end"
        >
          <AssetAvatar src={assetMap[symbol]?.image} alt={symbol} size="small" />
          <Stack>
            <span>{symbol}</span>
          </Stack>
        </Stack>
      </TableCell>
      <TableCell
        align="right"
        sx={{ fontFamily: MonoFont, maxWidth: 220, minWidth: 220, width: 220 }}
      >
        <Tooltip
          title={
            <Box sx={{ fontFamily: MonoFont }}>
              {typeof price?.value === "number" ? price.value : "Unknown"}
            </Box>
          }
        >
          <span>
            {typeof price?.value !== "number" ? (
              <Typography color="text.secondary" component="span" variant="inherit">
                Unknown
              </Typography>
            ) : (
              <>
                {formatNumber(price.value, {
                  maximumFractionDigits: 2, // TODO make this configurable
                  minimumFractionDigits: 2,
                })}{" "}
                USD
              </>
            )}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell
        align="right"
        sx={{ fontFamily: MonoFont, maxWidth: 220, minWidth: 220, width: 220 }}
      >
        <Tooltip title={<Box sx={{ fontFamily: MonoFont }}>{balance}</Box>}>
          <span>
            {formatNumber(balance, {
              maximumFractionDigits: 2, // TODO make this configurable
              minimumFractionDigits: 2,
            })}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell align="right" sx={{ fontFamily: MonoFont }}>
        <Tooltip
          title={
            <Box sx={{ fontFamily: MonoFont }}>
              {typeof value === "number"
                ? formatNumber(value, {
                    maximumFractionDigits: 100,
                  })
                : "Unknown"}
            </Box>
          }
        >
          <span>
            {typeof value !== "number" ? (
              <Typography color="text.secondary" component="span" variant="inherit">
                Unknown
              </Typography>
            ) : (
              <>
                {formatNumber(value, {
                  maximumFractionDigits: 2, // TODO make this configurable
                  minimumFractionDigits: 2,
                })}{" "}
                USD
              </>
            )}
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
