import { Slide, Stack, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"

export function InfoBanner() {
  const infoBanner =
    "Please make sure to backup your data before 15th of May 2025. Once version 2 is released your data will be difficult to recover."
  // useStore($infoBanner)
  const [showing, setShowing] = useState(infoBanner !== null)

  useEffect(() => {
    if (infoBanner && !showing) {
      setShowing(true)
    }

    if (!infoBanner && showing) {
      // setTimeout(() => {
      setShowing(false)
      // }, 3_000)
    }
  }, [infoBanner, showing])

  return (
    <Slide in={showing} direction="up">
      <Stack
        sx={{
          background: "var(--mui-palette-error-main)",
          bottom: 0,
          maxWidth: 1536 - 32,
          position: "fixed",
          width: "100%",
        }}
        alignItems="center"
      >
        <Typography paddingY={0.25} variant="caption" color="#fff">
          {infoBanner}
        </Typography>
      </Stack>
    </Slide>
  )
}
