import { Box, useTheme } from "@mui/material"
import React from "react"

const LG_HEIGHT = 1200
const MD_HEIGHT = 1035
const SM_HEIGHT = 1000
const XS_HEIGHT = 1430

export function HeroSection() {
  const theme = useTheme()

  if (theme.palette.mode === "dark")
    return (
      <Box
        sx={{
          background: `linear-gradient(rgb(0, 0, 0) 15%, rgb(89, 38, 182) 78.6494%, rgb(230, 169, 253) 100%)`,
          height: { lg: LG_HEIGHT, md: MD_HEIGHT, sm: SM_HEIGHT, xs: XS_HEIGHT },
          overflow: "hidden",
          pointerEvents: "none",
          position: "absolute",
          right: 0,
          top: 0,
          width: "100%",
          zIndex: -1,
        }}
      >
        <Box
          sx={{
            background:
              "radial-gradient(33.7% 50% at 50% 0%, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0) 68.4491%)",
            borderRadius: "100%",
            bottom: "-592px",
            flex: "0 0 auto",
            height: "783px",
            left: { lg: "calc(-30%)", md: "-50%", xs: "calc(-166.452%)" },
            overflow: "hidden",
            position: "absolute",
            width: { lg: "160%", md: "200%", xs: "433%" },
          }}
        />
        <Box
          sx={{
            background:
              "radial-gradient(64.4% 50% at 50% 50%, rgb(0, 0, 0) 77.986%, rgb(160, 104, 252) 100%)",
            borderRadius: "100%",
            bottom: "-593px",
            boxShadow: "rgba(230, 169, 251, 0.6) 0px 0px 250px 0px",
            flex: "0 0 auto",
            height: "783px",
            left: { lg: "calc(-30%)", md: "-50%", xs: "calc(-166.452%)" },
            overflow: "hidden",
            position: "absolute",
            width: { lg: "160%", md: "200%", xs: "433%" },
          }}
        />
      </Box>
    )

  return (
    <Box
      sx={{
        overflow: "hidden",
        pointerEvents: "none",
        position: "absolute",
        right: 0,
        top: 0,
        width: "100%",
        zIndex: -1,
      }}
    >
      <Box
        sx={{
          background: `radial-gradient(
              102.4% 100% at 75.5% -5.1%,
              rgb(206, 138, 255) .9009009009009009%,
              rgb(230, 153, 255) 34.08291103603604%,
              rgb(240, 194, 255) 54.82650619369369%,
              rgb(255, 255, 255) 100%)`,
          height: { lg: LG_HEIGHT, md: MD_HEIGHT, xs: XS_HEIGHT },
          left: 0,
          opacity: 0.2,
        }}
      >
        <Box
          sx={{
            inset: "-230px -138px -559px -137px",
            mixBlendMode: "overlay",
            opacity: 0.8,
            position: "absolute",
          }}
        >
          <Box
            sx={{
              backgroundBlendMode: "multiply",
              backgroundColor: "transparent",
              backgroundImage: `radial-gradient(
                    circle, 
                    rgb(0, 0, 0), 
                    rgba(33, 222, 222, 0)
                  ), 
                  repeating-radial-gradient(
                    circle, 
                    rgb(0, 0, 0), 
                    rgb(0, 0, 0), 
                    70px, 
                    transparent 140px, 
                    transparent 70px
                  )`,
              height: "100%",
              width: "100%",
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
