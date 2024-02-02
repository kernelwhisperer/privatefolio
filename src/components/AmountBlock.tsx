import { Box, Stack, Tooltip, Typography } from "@mui/material"
import React from "react"
import { MonoFont } from "src/theme"
import { EMPTY_OBJECT } from "src/utils/utils"

import { formatNumber, getDecimalPrecision } from "../utils/formatting-utils"

type AmountBlockProps = {
  amount?: string | number
  currencyName?: string
  currencySymbol?: string
  formatOpts?: Intl.NumberFormatOptions
  significantDigits?: number
  tooltipMessage?: string
}

export function AmountBlock(props: AmountBlockProps) {
  const {
    amount,
    currencyName,
    currencySymbol = "",
    significantDigits,
    tooltipMessage,
    formatOpts = EMPTY_OBJECT,
  } = props

  const hasValue = amount !== undefined
  const amountN = hasValue ? Number(amount) : undefined

  let minimumFractionDigits = significantDigits
  if (minimumFractionDigits === undefined && typeof amountN === "number") {
    if (amountN > 10_000 || amountN < -10_000) minimumFractionDigits = 0
    else if (amountN < 1 && amountN > -1)
      minimumFractionDigits = Math.min(getDecimalPrecision(amountN), 6)
  }

  return (
    <Tooltip
      title={
        typeof amountN === "number" ? (
          <Stack alignItems="center">
            <Box sx={{ fontFamily: MonoFont }}>
              {amount} {currencyName}
            </Box>
            <span className="secondary">(copy to clipboard)</span>
          </Stack>
        ) : (
          tooltipMessage
        )
      }
    >
      <Typography
        fontFamily={MonoFont}
        variant="inherit"
        component="span"
        sx={{ cursor: hasValue ? "pointer" : undefined }}
        onClick={() => {
          if (!hasValue) return

          navigator.clipboard.writeText(String(amount))
        }}
      >
        {typeof amountN === "number" ? (
          `${currencySymbol}${formatNumber(amountN, {
            maximumFractionDigits: minimumFractionDigits,
            minimumFractionDigits,
            // notation: "compact",
            ...formatOpts,
          })}`.replace(`${currencySymbol}-`, `-${currencySymbol}`)
        ) : (
          <Typography color="text.secondary" component="span" variant="inherit">
            Unknown
          </Typography>
        )}
      </Typography>
    </Tooltip>
  )
}
