import {
  Box,
  CircularProgress,
  circularProgressClasses,
  CircularProgressProps,
} from "@mui/material"
import React from "react"

export function CircularSpinner(props: CircularProgressProps) {
  const { size = 40, ...rest } = props

  return (
    <Box sx={{ height: size, position: "relative", width: size }}>
      <CircularProgress
        size={size}
        thickness={4}
        disableShrink
        {...rest}
        value={100}
        variant="determinate"
        sx={{
          color: "var(--mui-palette-LinearProgress-secondaryBg)",
          left: 0,
          position: "absolute",
          top: 0,
        }}
      />
      <CircularProgress
        variant="indeterminate"
        sx={{
          animationDuration: "550ms",
          left: 0,
          position: "absolute",
          top: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: "round",
          },
        }}
        size={size}
        thickness={4}
        disableShrink
        {...rest}
      />
    </Box>
  )
}
