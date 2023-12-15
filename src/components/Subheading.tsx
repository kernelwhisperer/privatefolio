import { Stack, Typography, TypographyProps } from "@mui/material"
import React from "react"

import { SerifFont } from "../theme"

export function Subheading({ sx = {}, ...rest }: TypographyProps) {
  return (
    <Typography
      variant="h6"
      fontFamily={SerifFont}
      sx={{ marginX: 2, minHeight: 36, ...sx }}
      component={Stack}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      {...rest}
    />
  )
}
