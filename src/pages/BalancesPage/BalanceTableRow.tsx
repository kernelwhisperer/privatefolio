import { Divider, Stack, TableCell, TableRow, Typography, useMediaQuery } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { useNavigate } from "react-router-dom"
import { AmountBlock } from "src/components/AmountBlock"

import { AssetAvatar } from "../../components/AssetAvatar"
import { Balance } from "../../interfaces"
import { $assetMap } from "../../stores/metadata-store"
import { TableRowComponentProps } from "../../utils/table-utils"

export function BalanceTableRow(props: TableRowComponentProps<Balance>) {
  const { row, headCells: _headCells, relativeTime: _relativeTime, ...rest } = props
  const { symbol, balance, price, value } = row
  const navigate = useNavigate()

  const assetMap = useStore($assetMap)

  const isTablet = useMediaQuery("(max-width: 899px)")

  if (isTablet) {
    return (
      <TableRow
        hover
        onClick={() => {
          navigate(`/asset/${symbol}`)
        }}
        sx={{ cursor: "pointer" }}
        {...rest}
      >
        <TableCell
          sx={{
            // maxWidth: 380, minWidth: 380,
            width: "100%",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" gap={1} alignItems="center" component="div">
              <AssetAvatar size="medium" src={assetMap[symbol]?.image} alt={symbol} />
              <Stack gap={0.5}>
                <Typography variant="body1" sx={{ marginBottom: -0.5 }}>
                  <span>{symbol}</span>
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  fontWeight={300}
                  letterSpacing={0.5}
                >
                  <AmountBlock amount={balance} />
                  <Divider orientation="vertical" sx={{ display: "inline", marginRight: 1 }} />
                  <AmountBlock amount={price?.value} currencySymbol="USD" significantDigits={2} />
                </Typography>
              </Stack>
            </Stack>
            <AmountBlock amount={value} currencySymbol="USD" significantDigits={2} />
          </Stack>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow
      hover
      onClick={() => {
        navigate(`/asset/${symbol}`)
      }}
      sx={{ cursor: "pointer" }}
      {...rest}
    >
      <TableCell sx={{ maxWidth: 380, minWidth: 160, width: 380 }}>
        <Stack direction="row" gap={1} alignItems="center" component="div">
          <AssetAvatar src={assetMap[symbol]?.image} alt={symbol} size="small" />
          <Stack>
            <span>{symbol}</span>
          </Stack>
        </Stack>
      </TableCell>
      <TableCell align="right" sx={{ maxWidth: 220, minWidth: 220, width: 220 }}>
        <AmountBlock amount={price?.value} currencySymbol="USD" significantDigits={2} />
      </TableCell>
      <TableCell align="right" sx={{ maxWidth: 220, minWidth: 220, width: 220 }}>
        <AmountBlock amount={balance} />
      </TableCell>
      <TableCell align="right" sx={{ maxWidth: 220, minWidth: 220, width: 220 }}>
        <AmountBlock amount={value} currencySymbol="USD" significantDigits={2} />
      </TableCell>
    </TableRow>
  )
}
