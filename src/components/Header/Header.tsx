"use client"

import { AppBar, Container, Grid, Stack, Toolbar } from "@mui/material"
import React from "react"
import { useLocation } from "react-router-dom"

import { TaskDropdown } from "../Tasks/TaskDropdown"
import { AccountPicker } from "./AccountPicker"
import { Logo } from "./Logo"
import { NavigationMenu } from "./NavigationMenu"
import { SettingsDrawer } from "./SettingsDrawer"

export function Header() {
  const location = useLocation()
  const { pathname } = location

  const overriddenPathname = pathname.includes("/asset/") ? "/" : pathname

  return (
    <AppBar
      position="static"
      elevation={0}
      // variant="outlined"
      color="transparent"
      sx={{
        border: "none",
        // borderLeft: "none",
        // borderRight: "none",
        // borderTop: "none",
      }}
    >
      <Toolbar disableGutters>
        <Container maxWidth="lg" sx={{ paddingX: { xs: 2 }, paddingY: 0, position: "relative" }}>
          <Grid container spacing={{ sm: 2, xs: 0 }} paddingX={2} marginY={1}>
            <Grid item md={3} sx={{ display: { md: "block", xs: "none" } }}>
              <Stack direction="row" gap={1} alignItems="center" sx={{ height: "100%" }}>
                <Logo />
              </Stack>
            </Grid>
            <Grid
              item
              xs={9}
              md={6}
              component={Stack}
              alignItems="center"
              justifyContent={{ md: "center" }}
            >
              <NavigationMenu activePath={overriddenPathname} />
            </Grid>
            <Grid
              item
              xs={3}
              md={3}
              gap={0.5}
              alignItems="center"
              component={Stack}
              justifyContent="flex-end"
            >
              <TaskDropdown />
              <SettingsDrawer />
              <AccountPicker />
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  )
}
