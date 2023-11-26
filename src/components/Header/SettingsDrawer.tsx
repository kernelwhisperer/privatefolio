"use client"

import { Settings as SettingsIcon } from "@mui/icons-material"
import { Box, Drawer, IconButton, Tooltip, useColorScheme } from "@mui/material"
import React, { useMemo } from "react"

import { useBoolean } from "../../hooks/useBoolean"
import { SettingsDrawerContents } from "./SettingsDrawerContents"

export function Settings() {
  const { mode = "system", setMode } = useColorScheme()
  const { value: open, toggle: toggleOpen } = useBoolean(false)

  const nextMode = useMemo(() => {
    if (mode === "light") return "dark"
    if (mode === "system") return "light"
    return "system"
  }, [mode])

  return (
    <>
      <Tooltip title={`Activate ${nextMode} mode`}>
        <IconButton
          // size="small"
          onClick={toggleOpen}
          // onClick={() => {
          //   setMode(nextMode)
          // }}
          color="secondary"
          // edge="end"
          sx={{ marginRight: { lg: -1 } }}
        >
          <SettingsIcon fontSize="small" />
          {/* {mode === "light" && <LightModeOutlined fontSize="small" />}
        {mode === "dark" && <DarkModeOutlined fontSize="small" />}
        {mode === "system" && <SettingsSuggestRounded fontSize="small" />} */}
        </IconButton>
      </Tooltip>
      <Drawer
        keepMounted
        open={open}
        anchor="right"
        elevation={2}
        slotProps={{ backdrop: { invisible: true } }}
        onClose={toggleOpen}
        sx={{
          "& .MuiDrawer-paper": {
            borderBottomLeftRadius: 16,
            borderTopLeftRadius: 16,
          },
        }}
      >
        <Box
        // sx={{ width: 320 }}
        // onClick={toggleDrawer(anchor, false)}
        // onKeyDown={toggleDrawer(anchor, false)}
        >
          <SettingsDrawerContents
            open={open}
            toggleOpen={toggleOpen}
            appVer={"0.1.0"} // TODO
            gitHash={"e00c2361a6bceee9404f8d0e097509b30f274a34"}
          />

          {/* <ThemeMode />
          <List>
            {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>{index % 2 === 0 ? <Inbox /> : <Inbox />}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {["All mail", "Trash", "Spam"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>{index % 2 === 0 ? <Inbox /> : <Inbox />}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List> */}
        </Box>
      </Drawer>
    </>
  )
}
