import { AppBar, Container, Stack, Toolbar } from "@mui/material"
import React from "react"
import { Logo } from "src/components/Header/Logo"

import { HeroSection } from "../HeroSection"
import { ThemeModeLanding } from "./ThemeModeLanding"

export default function HeaderLanding() {
  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backdropFilter: "none !important",
          background: "none !important",
          border: "none",
          color: "var(--mui-palette-primary-main) !important",
        }}
      >
        <Toolbar disableGutters>
          <Container
            disableGutters
            maxWidth="xl"
            sx={{ marginTop: -0.5, paddingX: { xs: 2 }, paddingY: 0, position: "relative" }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                height: "100%",
                paddingX: {
                  sm: 2,
                  xs: 1,
                },
                width: "100%",
              }}
            >
              <Logo />
              <Stack direction="row" gap={1} alignItems="center">
                <ThemeModeLanding />
              </Stack>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
      <HeroSection />
    </>
  )
}
