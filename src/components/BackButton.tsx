import { KeyboardBackspace } from "@mui/icons-material"
import { Button, ButtonProps } from "@mui/material"
import React, { ReactNode } from "react"
import { Link, LinkProps } from "react-router-dom"

export function BackButton(
  props: Omit<ButtonProps<"a">, "component"> & LinkProps & { children?: ReactNode }
) {
  return (
    <Button
      component={Link}
      size="small"
      sx={{ borderRadius: 16, paddingLeft: 1, paddingRight: 2 }}
      startIcon={<KeyboardBackspace sx={{ pointerEvents: "none" }} />}
      {...props}
    />
  )
}
