"use client";

import { Stack } from "@mui/material";
import React from "react";

import { Logo } from "./Logo";
import { Settings } from "./Settings";

export function Header() {
  return (
    <Stack
      gap={1}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      marginBottom={3}
    >
      <a href="/">
        <Logo />
      </a>
      <Settings />
    </Stack>
  );
}
