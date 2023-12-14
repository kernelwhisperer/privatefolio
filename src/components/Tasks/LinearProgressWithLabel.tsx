import Box from "@mui/material/Box"
import LinearProgress, { LinearProgressProps } from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import * as React from "react"

export function LinearProgressWithLabel(props: LinearProgressProps & { value?: number }) {
  return (
    <Box sx={{ alignItems: "center", display: "flex", height: 20.5 }}>
      <Box sx={{ mr: 1, width: "100%" }}>
        <LinearProgress
          variant={typeof props.value === "number" ? "determinate" : "indeterminate"}
          {...props}
        />
      </Box>
      {typeof props.value === "number" && (
        <Box sx={{ minWidth: 40, textAlign: "right" }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.value
          )}%`}</Typography>
        </Box>
      )}
    </Box>
  )
}
