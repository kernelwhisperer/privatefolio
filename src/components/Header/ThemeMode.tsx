import { DarkModeOutlined, LightMode, SettingsBrightness } from "@mui/icons-material"
import { Tab, Tabs, tabsClasses, useColorScheme, useTheme } from "@mui/material"
import React, { useEffect } from "react"

import { bgColor } from "../../theme"

export function ThemeMode() {
  const theme = useTheme()

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme.palette.background.default)
  }, [theme.palette.background.default])

  const { mode = "system", setMode } = useColorScheme()
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const newMode = newValue === 0 ? "light" : newValue === 1 ? "system" : "dark"
    setMode(newMode)
  }

  return (
    <>
      <meta name="theme-color" content={bgColor} />
      <Tabs
        variant="fullWidth"
        textColor="inherit"
        indicatorColor="secondary"
        value={mode === "light" ? 0 : mode === "system" ? 1 : 2}
        onChange={handleTabChange}
        sx={{
          background: "var(--mui-palette-background-paper)",
          borderRadius: 5,
          padding: 0.5,
          [`& .${tabsClasses.indicator}`]: {
            borderRadius: 5,
            height: "100%",
          },
          [`& .${tabsClasses.flexContainer} > button`]: {
            minHeight: 20,
            textTransform: "none !important",
            zIndex: 2,
          },
        }}
      >
        <Tab label="Light" icon={<LightMode />} iconPosition="start" disableRipple />
        <Tab label="System" icon={<SettingsBrightness />} iconPosition="start" disableRipple />
        <Tab label="Dark " icon={<DarkModeOutlined />} iconPosition="start" disableRipple />
      </Tabs>
    </>
  )
}
