"use client"

import { AppBar, Button, Container, Stack, Toolbar, Tooltip } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"

import { Logo } from "./Logo"
import { Settings } from "./Settings"

export function Header() {
  return (
    <AppBar
      position="static"
      elevation={0}
      // variant="outlined"
      color="transparent"
      sx={{
        borderLeft: "none",
        borderRight: "none",
        borderTop: "none",
      }}
    >
      <Toolbar disableGutters>
        <Container maxWidth="lg" sx={{ padding: { xs: 0 }, position: "relative" }}>
          <Stack
            gap={1}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            paddingX={2}
            marginY={1}
          >
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
            <Stack direction="row" sx={{ marginRight: -1 }}>
              <Button to={`/balances`} component={Link} color="inherit" sx={{ paddingX: 2 }}>
                Balances
              </Button>
              <Button to={`/audit-logs`} component={Link} color="inherit" sx={{ paddingX: 2 }}>
                Audit logs
              </Button>
              <Button to={`/import-data`} component={Link} color="inherit" sx={{ paddingX: 2 }}>
                Import data
              </Button>
              <Settings />
            </Stack>
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  )
}
