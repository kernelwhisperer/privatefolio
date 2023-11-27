"use client"

import { Settings as SettingsIcon } from "@mui/icons-material"
import { Drawer, IconButton, Tooltip } from "@mui/material"
import React from "react"

import { useBoolean } from "../../hooks/useBoolean"
import { SettingsDrawerContents } from "./SettingsDrawerContents"

export function SettingsDrawer() {
  const { value: open, toggle: toggleOpen } = useBoolean(false)

  return (
    <>
      <Tooltip title="Open Settings">
        <IconButton onClick={toggleOpen} sx={{ marginRight: { lg: -1 } }}>
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Drawer
        keepMounted
        open={open}
        anchor="right"
        elevation={2}
        // transitionDuration={500}
        // TODO this should have a delay
        slotProps={{ backdrop: { invisible: true } }}
        onClose={toggleOpen}
        sx={{
          "& .MuiDrawer-paper": {
            borderBottomLeftRadius: 16,
            borderTopLeftRadius: 16,
          },
        }}
      >
        <SettingsDrawerContents
          open={open}
          toggleOpen={toggleOpen}
          appVer={"0.1.0"} // TODO
          gitHash={"e00c2361a6bceee9404f8d0e097509b30f274a34"}
        />
      </Drawer>
    </>
  )
}
