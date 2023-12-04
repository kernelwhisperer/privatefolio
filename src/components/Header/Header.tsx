"use client"

import {
  AppBar,
  Button,
  ButtonProps,
  Container,
  Grid,
  Stack,
  Toolbar,
  Tooltip,
} from "@mui/material"
import React from "react"
import { Link, NavLink } from "react-router-dom"

import { TaskDropdown } from "../Tasks/TaskDropdown"
import { Logo } from "./Logo"
import { SettingsDrawer } from "./SettingsDrawer"

export function NavButton(props: ButtonProps<typeof NavLink>) {
  return (
    <Button
      component={NavLink}
      color="inherit"
      sx={{ "&.active": { textDecoration: "underline", textDecorationThickness: 2 }, paddingX: 2 }}
      {...props}
    />
  )
}

export function Header() {
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
        <Container maxWidth="lg" sx={{ padding: { xs: 0 }, position: "relative" }}>
          <Grid container spacing={0.5} paddingX={2} marginY={1}>
            <Grid item md={3}>
              <Tooltip title="View Homepage">
                <Button
                  to={`/`}
                  aria-label="View Homepage"
                  component={Link}
                  color="inherit"
                  sx={{
                    marginLeft: -1,
                    paddingX: 2,
                  }}
                >
                  <Logo />
                </Button>
              </Tooltip>
            </Grid>
            <Grid item md={6} gap={0.5} component={Stack} justifyContent="center">
              <NavButton to={`/`}>Balances</NavButton>
              <NavButton to={`/transactions`}>Transactions</NavButton>
              <NavButton to={`/audit-logs`}>Audit logs</NavButton>
              <NavButton to={`/import-data`}>Import data</NavButton>
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
