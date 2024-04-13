"use client"

import { AppBar, Container, Stack, Toolbar } from "@mui/material"
import React from "react"

import { CurrencySelector } from "../CurrencySelector"
import { TaskDropdown } from "../Tasks/TaskDropdown"
import { AccountPickerButton } from "./AccountPickerButton"
import { NavigationMenu } from "./NavigationMenu"

export function Header() {
  return (
    <AppBar position="static" elevation={0} sx={{ background: "none !important", border: "none" }}>
      <Toolbar disableGutters>
        <Container
          disableGutters
          maxWidth="xl"
          sx={{ paddingX: 2, paddingY: 0, position: "relative" }}
        >
          <Stack direction="row" gap={1} justifyContent="space-between">
            <Stack direction="row" alignItems="center" sx={{ flex: 1 }} gap={1}>
              <NavigationMenu />
              {/* <TextField
                size="small"
                placeholder="Search for transaction, asset, etc"
                sx={{
                  [`& .${inputBaseClasses.input}`]: {
                    fontWeight: 200,
                    paddingY: 0.75,
                  },
                  [`& .${inputBaseClasses.root}`]: {
                    backgroundColor: "var(--mui-palette-background-paperTransparent)",
                    borderRadius: 2,
                  },
                  maxWidth: 460,
                  width: "100%",
                }}
              /> */}
            </Stack>
            <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-end">
              <TaskDropdown />
              <CurrencySelector />
              <AccountPickerButton />
            </Stack>
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  )
}
