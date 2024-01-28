import { Stack, TableCell, TableRow, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { useNavigate } from "react-router-dom"
import { AmountBlock } from "src/components/AmountBlock"
import { $baseCurrency } from "src/stores/account-settings-store"

import { AssetAvatar } from "../../components/AssetAvatar"
import { Balance } from "../../interfaces"
import { $assetMap } from "../../stores/metadata-store"
import { TableRowComponentProps } from "../../utils/table-utils"

export function BalanceTableRow(props: TableRowComponentProps<Balance>) {
  const {
    row,
    isTablet,
    headCells: _headCells,
    isMobile: _isMobile,
    isTablet: _isTablet,
    relativeTime: _relativeTime,
    ...rest
  } = props
  const { symbol, balance, price, value } = row

  const navigate = useNavigate()
  const assetMap = useStore($assetMap)

  const currency = useStore($baseCurrency)

  if (isTablet) {
    return (
      <TableRow
        hover
        onClick={() => {
          navigate(`./asset/${symbol}`)
        }}
        sx={{ cursor: "pointer" }}
        {...rest}
      >
        <TableCell sx={{ width: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" gap={1} alignItems="center" component="div">
              <AssetAvatar size="medium" src={assetMap[symbol]?.image} alt={symbol} />
              <Stack>
                <Typography variant="body1">
                  <span>{symbol}</span>
                </Typography>
                <Typography
                  color="text.secondary"
                  variant="caption"
                  fontWeight={300}
                  letterSpacing={0.5}
                >
                  <AmountBlock amount={balance} />
                </Typography>
              </Stack>
            </Stack>
            <Stack alignItems="flex-end">
              <Typography variant="body1">
                <AmountBlock
                  amount={String(value)}
                  currencySymbol={currency.symbol}
                  currencyName={currency.name}
                  significantDigits={currency.significantDigits}
                />
              </Typography>
              <Typography
                color="text.secondary"
                variant="caption"
                fontWeight={300}
                letterSpacing={0.5}
              >
                <AmountBlock
                  amount={String(price?.value)}
                  currencySymbol={currency.symbol}
                  currencyName={currency.name}
                  significantDigits={currency.maxDigits}
                />
              </Typography>
            </Stack>
          </Stack>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow
      hover
      onClick={() => {
        navigate(`./asset/${symbol}`)
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
        <AmountBlock amount={balance} />
      </TableCell>
      <TableCell align="right" sx={{ maxWidth: 220, minWidth: 220, width: 220 }}>
        <AmountBlock
          amount={String(price?.value)}
          currencySymbol={currency.symbol}
          currencyName={currency.name}
          significantDigits={currency.maxDigits}
        />
      </TableCell>
      <TableCell align="right" sx={{ maxWidth: 220, minWidth: 220, width: 220 }}>
        <AmountBlock
          amount={String(value)}
          currencySymbol={currency.symbol}
          currencyName={currency.name}
          significantDigits={currency.maxDigits}
        />
      </TableCell>
    </TableRow>
  )
}
