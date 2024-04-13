import { Stack, Typography, TypographyProps } from "@mui/material"
import React from "react"

import { SerifFont } from "../theme"

export function Subheading({ sx = {}, ...rest }: TypographyProps) {
  return (
    <Typography
      color="primary"
      variant="h6"
      fontFamily={SerifFont}
      sx={{
        //
        letterSpacing: 0.75,
        minHeight: 36,
        paddingLeft: 2,
        ...sx,
      }}
      component={Stack}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      {...rest}
    />
  )
}
