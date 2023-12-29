import { Tabs as MuiTabs, tabsClasses, TabsProps } from "@mui/material"
import { grey } from "@mui/material/colors"
import React from "react"
import { SerifFont } from "src/theme"

export function Tabs({ sx, ...rest }: TabsProps) {
  return (
    <MuiTabs
      sx={(theme) => ({
        marginX: 2,
        [`& .${tabsClasses.indicator}`]: {
          background: grey[600],
          //
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          height: 4,
        },
        [`& .${tabsClasses.flexContainer}`]: {
          gap: 2,
        },
        [`& .${tabsClasses.flexContainer} > a`]: {
          ...theme.typography.body1,
          fontFamily: SerifFont,
          fontWeight: 500,
          letterSpacing: 0.5,
          //
          minWidth: 0,
          paddingX: 0,
          transition: theme.transitions.create("color"),
        },
        [`& .${tabsClasses.flexContainer} > a:hover`]: {
          color: theme.palette.text.primary,
        },
        ...(typeof sx === "function" ? sx(theme) : {}),
      })}
      {...rest}
    />
  )
}
