import { Box, Tooltip, Typography } from "@mui/material"
import React from "react"
import { MonoFont } from "src/theme"
import { EMPTY_OBJECT } from "src/utils/utils"

import { formatNumber } from "../utils/formatting-utils"

type AmountBlockProps = {
  amount?: number
  currencySymbol?: string
  formatOpts?: Intl.NumberFormatOptions
  significantDigits?: number
}

const DEFAULT_SIGNIFICANT_DIGITS = 2

export function AmountBlock(props: AmountBlockProps) {
  const { amount, currencySymbol, significantDigits, formatOpts = EMPTY_OBJECT } = props

  const decimals = significantDigits ?? DEFAULT_SIGNIFICANT_DIGITS

  return (
    <Tooltip
      title={
        typeof amount === "number" ? (
          <Box sx={{ fontFamily: MonoFont }}>
            {formatNumber(amount, {
              maximumFractionDigits: significantDigits || 99,
              minimumFractionDigits: decimals,
              ...formatOpts,
            })}{" "}
            {currencySymbol}
          </Box>
        ) : (
          "Use the 'Compute balances' action to compute these values."
        )
      }
    >
      <Typography fontFamily={MonoFont} variant="inherit" component="span">
        {typeof amount === "number" ? (
          <>
            {formatNumber(amount, {
              maximumFractionDigits: decimals, // TODO make this configurable
              minimumFractionDigits: decimals,
              ...formatOpts,
            })}{" "}
            {currencySymbol && (
              <Typography color="text.secondary" component="span" variant="inherit">
                {currencySymbol}
              </Typography>
            )}
          </>
        ) : (
          <Typography color="text.secondary" component="span" variant="inherit">
            Unknown
          </Typography>
        )}
      </Typography>
    </Tooltip>
  )
}
