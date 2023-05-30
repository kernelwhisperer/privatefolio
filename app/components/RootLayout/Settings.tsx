"use client";

import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import { IconButton, PaletteMode } from "@mui/material";
import React from "react";

export interface SettingsProps {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
}

export function Settings(props: SettingsProps) {
  const { mode, setMode } = props;
  return (
    <>
      <IconButton
        size="large"
        onClick={() => setMode(mode === "light" ? "dark" : "light")}
        color="primary"
      >
        {mode === "dark" ? (
          <LightModeOutlined fontSize="small" />
        ) : (
          <DarkModeOutlined fontSize="small" />
        )}
      </IconButton>
    </>
  );
}
