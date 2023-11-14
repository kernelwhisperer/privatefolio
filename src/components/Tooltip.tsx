import { Fade } from "@mui/material"
import { styled } from "@mui/material/styles"
import MuiTooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip"
import * as React from "react"

export const Tooltip = styled(({ className, ...props }: TooltipProps) => (
  <MuiTooltip
    TransitionComponent={Fade}
    classes={{ popper: className }}
    arrow
    // enterDelay={800}
    disableInteractive
    followCursor
    PopperProps={{
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 25],
          },
        },
      ],
    }}
    {...props}
  />
))(({ theme }) => ({
  zIndex: 3000,
  [`& .${tooltipClasses.tooltip}`]: {
    color: "var(--mui-palette-text-secondary)",
    fontSize: theme.typography.overline.fontSize,
    maxWidth: 280,
    padding: 10,
  },
}))
