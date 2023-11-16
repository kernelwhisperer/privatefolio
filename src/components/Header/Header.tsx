"use client"

import { AppBar, Button, Container, Stack, Toolbar } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"

import { Tooltip } from "../Tooltip"
import { Logo } from "./Logo"
import { Settings } from "./Settings"

export function Header() {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      variant="outlined"
      color="default"
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
              <Button
                to={`/transactions`}
                aria-label="View Transactions"
                component={Link}
                color="inherit"
                sx={{
                  marginLeft: -2,
                  paddingX: 2,
                }}
              >
                Transactions
              </Button>
              <Settings />
            </Stack>
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  )
}
