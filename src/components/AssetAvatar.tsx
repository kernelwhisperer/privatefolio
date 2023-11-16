import { alpha, Avatar, AvatarProps, styled, Typography } from "@mui/material"
import React from "react"

import { MonoFont } from "../theme"
import { stringToColor } from "../utils/color-utils"

const StyledAvatar = styled(Avatar)`
  &.MuiAvatar-colorDefault {
    border: 1px solid ${({ color = "#fff" }) => alpha(color, 0.25)};
    background: ${({ color = "#fff" }) => alpha(color, 0.15)};
  }
`

interface AssetAvatarProps extends AvatarProps {
  children: string
  size?: "small" | "large"
}

const smallSize = 18
const largeSize = 40

export function AssetAvatar(props: AssetAvatarProps) {
  const { children, size = "large", ...rest } = props
  const color = stringToColor(children)

  return (
    <StyledAvatar
      sx={{
        height: size === "small" ? smallSize : largeSize,
        width: size === "small" ? smallSize : largeSize,
      }}
      color={color}
      {...rest}
    >
      <Typography
        fontWeight={500}
        fontSize={size === "small" ? "0.65rem" : "0.85rem"}
        fontFamily={MonoFont}
        color={color}
      >
        {children.slice(0, size === "small" ? 1 : 3)}
      </Typography>
    </StyledAvatar>
  )
}
