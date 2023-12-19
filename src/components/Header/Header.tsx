"use client"

import {
  AppBar,
  Box,
  Container,
  Grid,
  Stack,
  Tab,
  TabProps,
  Tabs,
  tabsClasses,
  Toolbar,
} from "@mui/material"
import { grey } from "@mui/material/colors"
import React from "react"
import { NavLink, useLocation } from "react-router-dom"

import { TaskDropdown } from "../Tasks/TaskDropdown"
import { Logo } from "./Logo"
import { SettingsDrawer } from "./SettingsDrawer"

export function NavButton(props: TabProps<typeof NavLink>) {
  return (
    <Tab component={NavLink} LinkComponent={NavLink} sx={{ textTransform: "none" }} {...props} />
  )
}

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
          <Grid container spacing={0.5} paddingX={2} marginY={1}>
            <Grid item md={3}>
              <Box
                sx={{
                  marginLeft: -1,
                  paddingX: 2,
                  paddingY: 1,
                }}
              >
                <Logo />
              </Box>
            </Grid>
            <Grid item md={6} component={Stack} justifyContent="center">
              <Tabs
                value={overriddenPathname}
                sx={(theme) => ({
                  [`& .${tabsClasses.indicator}`]: {
                    background: grey[600],
                    borderRadius: 2,
                    bottom: 8,
                    height: 4,
                  },
                  [`& .${tabsClasses.flexContainer}`]: {
                    gap: 2,
                  },
                  [`& .${tabsClasses.flexContainer} > a`]: {
                    minWidth: 0,
                    paddingX: 0,
                    transition: theme.transitions.create("color"),
                  },
                  [`& .${tabsClasses.flexContainer} > a:hover`]: {
                    color: theme.palette.text.primary,
                  },
                })}
              >
                <NavButton value="/" to="/" label="Home" />
                <NavButton value="/transactions" to="/transactions" label="Transactions" />
                <NavButton value="/audit-logs" to="/audit-logs" label="Audit logs" />
                <NavButton value="/import-data" to="/import-data" label="Import data" />
              </Tabs>
            </Grid>
            <Grid
              item
              md={3}
              alignItems="center"
              gap={0.5}
              component={Stack}
              justifyContent="flex-end"
            >
              <TaskDropdown />
              <SettingsDrawer />
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  )
}
