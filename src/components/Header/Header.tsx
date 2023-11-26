"use client"

import { AppBar, Button, Container, Grid, Stack, Toolbar, Tooltip } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"

import { TaskDropdown } from "../Tasks/TaskDropdown"
import { Logo } from "./Logo"
import { Settings } from "./SettingsDrawer"

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
              <Button to={`/balances`} component={Link} color="inherit" sx={{ paddingX: 2 }}>
                Balances
              </Button>
              <Button to={`/audit-logs`} component={Link} color="inherit" sx={{ paddingX: 2 }}>
                Audit logs
              </Button>
              <Button to={`/import-data`} component={Link} color="inherit" sx={{ paddingX: 2 }}>
                Import data
              </Button>
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
              <Settings />
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  )
}
