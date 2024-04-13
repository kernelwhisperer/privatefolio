import {
  CssBaseline,
  CssVarsThemeOptions,
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
  useMediaQuery,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import { Globals, useReducedMotion } from "@react-spring/web"
import { merge } from "lodash-es"
import React, { PropsWithChildren, useEffect, useMemo } from "react"
import { useLocation } from "react-router-dom"

import { ThemeSideEffects } from "./components/ThemeSideEffects"
import { $reducedMotion } from "./stores/app-store"
import { theme } from "./theme"
import { themeLanding } from "./theme-landing"

export function ThemeProvider({ children }: PropsWithChildren) {
  const reducedMotion = useStore($reducedMotion)
  const browserPreference = useReducedMotion()

  const isMobile = useMediaQuery("(max-width: 599px)")
  const isTablet = useMediaQuery("(max-width: 899px)")
  const isDesktop = !isMobile && !isTablet
  // const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down("md")) FIXME

  const skipAnimation = useMemo(() => {
    if (reducedMotion === "never") {
      return false
    } else if (reducedMotion === "always") {
      return true
    } else if (browserPreference) {
      return browserPreference
    } else {
      return isMobile
    }
  }, [reducedMotion, browserPreference, isMobile])

  useEffect(() => {
    Globals.assign({ skipAnimation })
  }, [skipAnimation])

  const location = useLocation()
  const { pathname } = location

  const extendedTheme = useMemo(
    () =>
      extendTheme(
        merge({}, theme, {
          components: {
            MuiDialog: {
              defaultProps: {
                fullScreen: !isDesktop,
                slotProps: { backdrop: { invisible: !isTablet } },
              },
            },
            MuiDrawer: {
              defaultProps: {
                disableScrollLock: !isTablet,
                slotProps: { backdrop: { invisible: !isTablet } },
              },
            },
            MuiPopover: {
              defaultProps: {
                disableScrollLock: !isTablet,
              },
            },
          },
          ...(pathname === "/" ? themeLanding : {}),
          ...(skipAnimation
            ? ({
                components: {
                  MuiButtonBase: {
                    defaultProps: {
                      disableRipple: true, // No more ripple, on the whole application 💣!
                    },
                  },
                  MuiSkeleton: {
                    defaultProps: {
                      animation: false,
                    },
                  },
                },
                transitions: {
                  // So we have `transition: none;` everywhere
                  create: () => "none",
                },
              } as CssVarsThemeOptions)
            : {}),
        })
      ),
    [isDesktop, isTablet, pathname, skipAnimation]
  )

  // console.log("📜 LOG > ThemeProvider > extendedTheme:", extendedTheme)
  return (
    <CssVarsProvider defaultMode="system" theme={extendedTheme} disableTransitionOnChange>
      <CssBaseline enableColorScheme />
      {children}
      <ThemeSideEffects />
    </CssVarsProvider>
  )
}
