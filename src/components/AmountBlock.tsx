import { Box, Stack, Tooltip, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { useState } from "react"
import { $debugMode } from "src/stores/app-store"
import { MonoFont } from "src/theme"
import { greenColor, redColor } from "src/utils/color-utils"
import { EMPTY_OBJECT } from "src/utils/utils"

import { formatNumber, getDecimalPrecision } from "../utils/formatting-utils"

type AmountBlockProps = {
  amount?: string | number
  colorized?: boolean
  currencySymbol?: string
  currencyTicker?: string
  // formatOpts?: Intl.NumberFormatOptions
  placeholder?: string
  showSign?: boolean
  showTicker?: boolean
  significantDigits?: number
  tooltipMessage?: string
}

const showSignOpts = { signDisplay: "always" } as const

export function AmountBlock(props: AmountBlockProps) {
  const {
    amount,
    currencyTicker,
    currencySymbol = "",
    significantDigits,
    tooltipMessage,
    // formatOpts = EMPTY_OBJECT,
    placeholder = "Unknown",
    colorized,
    showTicker,
    showSign,
  } = props

  const hasValue = amount !== undefined
  const amountN = hasValue ? Number(amount) : undefined
  const formatOpts = showSign && amount !== 0 ? showSignOpts : EMPTY_OBJECT

  const debugMode = useStore($debugMode)

  // let minimumFractionDigits = currencyTicker === "USDT" ? 2 : significantDigits TODO derive this from the ticker
  let minimumFractionDigits = debugMode ? 4 : significantDigits
  if (minimumFractionDigits === undefined && typeof amountN === "number") {
    if (amountN > 10_000 || amountN < -10_000) minimumFractionDigits = 0
    else if (amountN < 1 && amountN > -1)
      minimumFractionDigits = Math.min(getDecimalPrecision(amountN), 6)
  }

  const [copied, setCopied] = useState(false)

  return (
    <Tooltip
      title={
        typeof amountN === "number" ? (
          <Stack alignItems="center">
            <Box sx={{ fontFamily: MonoFont }}>
              {amount} {currencyTicker}
            </Box>
            <span className="secondary">({copied ? "copied" : "copy to clipboard"})</span>
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
        sx={{
          color: !colorized
            ? undefined
            : typeof amountN !== "number"
            ? undefined
            : amountN === 0
            ? "text.secondary"
            : amountN > 0
            ? greenColor
            : redColor,
          cursor: hasValue ? "pointer" : undefined,
        }}
        onClick={() => {
          if (!hasValue) return

          navigator.clipboard.writeText(String(amount))

          setCopied(true)

          setTimeout(() => {
            setCopied(false)
          }, 1_000)
        }}
      >
        {typeof amountN === "number" ? (
          `${currencySymbol}${formatNumber(amountN, {
            maximumFractionDigits: minimumFractionDigits,
            minimumFractionDigits,
            // notation: "compact",
            ...formatOpts,
          })} ${showTicker ? currencyTicker : ""}`.replace(
            `${currencySymbol}-`,
            `-${currencySymbol}`
          )
        ) : (
          <Typography color="text.secondary" component="span" variant="inherit">
            {placeholder}
          </Typography>
        )}
      </Typography>
    </Tooltip>
  )
}
