import { Stack, Typography } from "@mui/material"
import React from "react"

import { RobotoMonoFF } from "../../theme"

interface AssetChangeProps {
  amount: string
  imageSrc?: string
  label: string
  negative?: boolean
  symbol: string
  valueAmount: string
}

export function AssetChange(props: AssetChangeProps) {
  const { label, amount, negative = false, valueAmount, imageSrc, symbol } = props

  return (
    <>
      <Stack alignItems="flex-start" gap={1}>
        <Stack direction="row" gap={1}>
          {/* <AssetAvatar src={imageSrc} alt={symbol}>
            {symbol}
          </AssetAvatar> */}
          <Stack alignSelf="center">
            <Typography fontFamily={RobotoMonoFF} component="div" variant="inherit">
              {amount}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </>
  )
}
