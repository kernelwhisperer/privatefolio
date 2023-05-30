"use client";

import { Stack, Typography } from "@mui/material";
import React from "react";

import { Settings, SettingsProps } from "./Settings";

export function Header(props: SettingsProps) {
  return (
    <Stack
      gap={1}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
    >
      <Typography
        fontWeight={700}
        sx={{
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundImage:
            "linear-gradient(45deg, rgb(124, 58, 237), #da62c4 30%, white 60%)",
          backgroundPosition: "0%",
          backgroundSize: "400%",
        }}
        variant="h2"
        component="h1"
        gutterBottom
      >
        TradeJournal
      </Typography>
      <Settings {...props} />
    </Stack>
  );
}
