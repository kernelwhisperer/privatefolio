import { alpha, Avatar, AvatarProps, styled, Typography } from "@mui/material"
import React from "react"

import { RobotoMonoFF } from "../theme"
import { stringToColor } from "../utils/color-utils"

const StyledAvatar = styled(Avatar)`
  &.MuiAvatar-colorDefault {
    border: 1px solid ${({ color = "#fff" }) => alpha(color, 0.25)};
    background: ${({ color = "#fff" }) => alpha(color, 0.15)};
  }
`

export function AssetAvatar(props: AvatarProps & { children: string }) {
  const { children, ...rest } = props
  const color = stringToColor(children)

  return (
    <StyledAvatar
      sx={{
        height: { lg: 40, xs: 36 },
        width: { lg: 40, xs: 36 },
      }}
      {...rest}
      color={color}
    >
      <Typography variant="subtitle2" fontFamily={RobotoMonoFF} color={color}>
        {children.slice(0, 3)}
      </Typography>
    </StyledAvatar>
  )
}
