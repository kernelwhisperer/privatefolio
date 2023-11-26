import {
  AnimationRounded,
  DisplaySettingsRounded,
  RadioButtonUncheckedRounded,
} from "@mui/icons-material"
import { Tab, Tabs, tabsClasses, useMediaQuery } from "@mui/material"
import { useStore } from "@nanostores/react"
import { Globals, useReducedMotion } from "@react-spring/web"
import React, { useEffect, useMemo } from "react"

import { $reducedMotion } from "../../stores/app-store"

export function ReducedMotion() {
  const reducedMotion = useStore($reducedMotion)
  const userPreference = useReducedMotion()

  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down("md"))

  const skipAnimation = useMemo(() => {
    if (reducedMotion === "never") {
      return false
    } else if (reducedMotion === "always") {
      return true
    } else if (userPreference) {
      return userPreference
    } else {
      return isMobile
    }
  }, [reducedMotion, userPreference, isMobile])

  useEffect(() => {
    Globals.assign({ skipAnimation })
  }, [skipAnimation])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const newReducedMotion = newValue === 0 ? "always" : newValue === 1 ? "user" : "never"
    $reducedMotion.set(newReducedMotion)
    localStorage.setItem("reduced-motion", newReducedMotion)
  }

  return (
    <Tabs
      variant="fullWidth"
      textColor="inherit"
      indicatorColor="secondary"
      value={reducedMotion === "always" ? 0 : reducedMotion === "user" ? 1 : 2}
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
      <Tab
        label="Fewer"
        icon={<RadioButtonUncheckedRounded />}
        iconPosition="start"
        disableRipple
      />
      <Tab label="System" icon={<DisplaySettingsRounded />} iconPosition="start" disableRipple />
      <Tab label="More " icon={<AnimationRounded />} iconPosition="start" disableRipple />
    </Tabs>
  )
}
