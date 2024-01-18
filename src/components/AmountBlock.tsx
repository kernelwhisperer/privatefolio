import { Box, Tooltip, Typography } from "@mui/material"
import React from "react"
import { MonoFont } from "src/theme"
import { EMPTY_OBJECT } from "src/utils/utils"

import { formatNumber } from "../utils/formatting-utils"

type AmountBlockProps = {
  amount?: number
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
    currencySymbol,
    significantDigits,
    tooltipMessage,
    formatOpts = EMPTY_OBJECT,
  } = props

  const minimumFractionDigits = significantDigits
  const maximumFractionDigits = significantDigits || 99

  return (
    <Tooltip
      title={
        typeof amount === "number" ? (
          <Box sx={{ fontFamily: MonoFont }}>
            {formatNumber(amount, {
              maximumFractionDigits,
              minimumFractionDigits,
              ...formatOpts,
            })}{" "}
            {currencyName}
          </Box>
        ) : (
          tooltipMessage
        )
      }
    >
      <Typography
        fontFamily={MonoFont}
        variant="inherit"
        component="span"
        sx={{ cursor: amount ? "pointer" : undefined }}
        onClick={() => {
          if (!amount) return

          navigator.clipboard.writeText(
            formatNumber(amount, {
              maximumFractionDigits,
              minimumFractionDigits,
              ...formatOpts,
            })
          )
        }}
      >
        {typeof amount === "number" ? (
          <>
            {currencySymbol}
            {formatNumber(amount, {
              maximumFractionDigits: minimumFractionDigits,
              minimumFractionDigits,
              // notation: "compact",
              ...formatOpts,
            })}
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
