"use client"

import { DarkModeOutlined, LightModeOutlined, SettingsSuggestRounded } from "@mui/icons-material"
import { IconButton, Tooltip, useColorScheme } from "@mui/material"
import React, { useMemo } from "react"

export function Settings() {
  const { mode = "system", setMode } = useColorScheme()

  const nextMode = useMemo(() => {
    if (mode === "light") return "dark"
    if (mode === "system") return "light"
    return "system"
  }, [mode])

  return (
    <Tooltip title={`Activate ${nextMode} mode`}>
      <IconButton
        size="large"
        onClick={() => {
          setMode(nextMode)
        }}
        color="inherit"
      >
        {mode === "light" && <LightModeOutlined fontSize="small" />}
        {mode === "dark" && <DarkModeOutlined fontSize="small" />}
        {mode === "system" && <SettingsSuggestRounded fontSize="small" />}
      </IconButton>
    </Tooltip>
  )
}
