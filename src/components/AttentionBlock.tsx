// import InfoRoundedIcon from "@mui/icons-material/InfoRounded"
import { Stack, StackProps } from "@mui/material"
import React from "react"

export function AttentionBlock(props: StackProps) {
  return (
    <Stack
      direction="row"
      gap={1}
      alignItems="center"
      sx={(theme) => ({
        borderRadius: 0,
        color: "text.secondary",
        justifyContent: "flex-start",
        paddingX: 1.5,
        paddingY: 1,
        textAlign: "start",
        ...theme.typography.body2,
      })}
      {...props}
    />
  )
}
