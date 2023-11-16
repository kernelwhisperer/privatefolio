import { Typography } from "@mui/material"
import React from "react"

import { SerifFont } from "../../theme"

export function Logo() {
  return (
    <Typography variant="h5" fontFamily={SerifFont} fontWeight={500}>
      Privatefolio
    </Typography>
  )
}
