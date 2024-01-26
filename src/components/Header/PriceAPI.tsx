import { Tab, Tabs, tabsClasses } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { PriceApiId } from "src/interfaces"
import { $priceApiPref, $priceApiPreferences } from "src/stores/account-settings-store"
import { $activeAccount } from "src/stores/account-store"

import { bgColor } from "../../theme"

export function PriceAPI() {
  const priceApiPref = useStore($priceApiPref)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const newApiPreference: PriceApiId | undefined =
      newValue === 0 ? "coinbase" : newValue === 1 ? "binance" : undefined

    $priceApiPreferences.setKey($activeAccount.get(), newApiPreference)
  }

  return (
    <>
      <meta name="theme-color" content={bgColor} />
      <Tabs
        variant="fullWidth"
        // textColor="inherit"
        value={priceApiPref === "coinbase" ? 0 : priceApiPref === "binance" ? 1 : 2}
        onChange={handleTabChange}
        sx={(theme) => ({
          background: "var(--mui-palette-background-default)",
          borderRadius: 1,
          padding: 0.5,
          [`& .${tabsClasses.indicator}`]: {
            background: "var(--mui-palette-background-paper)",
            backgroundImage: "var(--mui-overlays-2)",
            borderRadius: 0.75,
            height: "100%",
          },
          [`& .${tabsClasses.flexContainer}`]: {
            gap: 0.5,
          },
          [`& .${tabsClasses.flexContainer} > button`]: {
            borderRadius: 0.75,
            minHeight: 20,
            textTransform: "none !important",
            transition: theme.transitions.create("color"),
            willChange: "background",
            zIndex: 2,
          },
          [`& .${tabsClasses.flexContainer} > button:hover`]: {
            color: theme.palette.text.primary,
          },
        })}
      >
        <Tab label="Coinbase" />
        <Tab label="Binance" />
        <Tab label="Default" />
      </Tabs>
    </>
  )
}
