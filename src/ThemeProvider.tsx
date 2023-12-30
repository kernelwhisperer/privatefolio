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

import { $reducedMotion } from "./stores/app-store"
import { theme } from "./theme"

export function ThemeProvider({ children }: PropsWithChildren) {
  const reducedMotion = useStore($reducedMotion)
  const browserPreference = useReducedMotion()

  const isMobile = useMediaQuery("(max-width: 599px)")
  // const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down("md"))

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

  const extendedTheme = useMemo(
    () =>
      extendTheme(
        merge(
          {},
          theme,
          skipAnimation
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
            : {}
        )
      ),
    [skipAnimation]
  )
  return (
    <>
      <CssVarsProvider defaultMode="system" theme={extendedTheme} disableTransitionOnChange>
        <CssBaseline enableColorScheme />
        {children}
      </CssVarsProvider>
    </>
  )
}
