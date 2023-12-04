import { alpha, Avatar, AvatarProps, styled, Typography } from "@mui/material"
import React from "react"

import { MonoFont } from "../theme"
import { stringToColor } from "../utils/color-utils"

const StyledAvatar = styled(Avatar)`
  border-radius: 0;
  & img {
    object-fit: contain;
  }
  &.MuiAvatar-colorDefault {
    border-radius: 50%;
    border: 1px solid ${({ color = "#fff" }) => alpha(color, 0.25)};
    background: ${({ color = "#fff" }) => alpha(color, 0.15)};
  }
`

export interface AssetAvatarProps extends AvatarProps {
  alt: string
  size?: "small" | "medium" | "large"
}

const SIZE_MAP = {
  large: 50,
  medium: 34,
  small: 16,
}

export function AssetAvatar(props: AssetAvatarProps) {
  const { alt, size = "medium", sx, ...rest } = props
  const color = stringToColor(alt)

  return (
    <StyledAvatar
      sx={{
        height: SIZE_MAP[size],
        width: SIZE_MAP[size],
        ...sx,
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
        {alt.slice(0, size === "small" ? 1 : 3)}
      </Typography>
    </StyledAvatar>
  )
}
