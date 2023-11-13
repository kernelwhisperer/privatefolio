"use client"

import { Button, Stack } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"

import { Logo } from "./Logo"
import { Settings } from "./Settings"

export function Header() {
  return (
    <Stack
      gap={1}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      paddingX={2}
      marginBottom={3}
      marginTop={1}
    >
      <Button
        to={`/`}
        aria-label="Visit Homepage"
        component={Link}
        sx={{
          marginLeft: -2,
          paddingX: 2,
        }}
      >
        <Logo />
      </Button>
      <Settings />
    </Stack>
  )
}
