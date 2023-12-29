import { MenuRounded } from "@mui/icons-material"
import { Box, IconButton, InputBase, Select, tabsClasses, Tooltip } from "@mui/material"
import { grey } from "@mui/material/colors"
import React from "react"
import { useBoolean } from "src/hooks/useBoolean"

import { NavMenuItem } from "../NavMenuItem"
import { NavTab } from "../NavTab"
import { Tabs } from "../Tabs"

export function NavigationMenu({ activePath }: { activePath: string }) {
  const { value: open, toggle: toggleOpen } = useBoolean(false)

  return (
    <>
      <Box sx={{ display: { sm: "none" } }}>
        <Select
          open={open}
          onClose={toggleOpen}
          onOpen={toggleOpen}
          value={activePath || ""}
          IconComponent={() => false}
          input={
            <InputBase sx={{ height: 42, position: "absolute", visibility: "hidden", width: 30 }} />
          }
        >
          <NavMenuItem value="/" to="/" label="Home" />
          <NavMenuItem value="/transactions" to="/transactions" label="Transactions" />
          <NavMenuItem value="/audit-logs" to="/audit-logs" label="Audit logs" />
          <NavMenuItem value="/import-data" to="/import-data" label="Import data" />
        </Select>
        <Tooltip title="Open Navigation menu">
          <IconButton edge="start" onClick={toggleOpen}>
            <MenuRounded fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>
      <Tabs
        value={activePath}
        sx={(theme) => ({
          display: { sm: "block", xs: "none" },
          height: 48,
          marginX: 0, // TODO why is this needed?
          [`& .${tabsClasses.indicator}`]: {
            background: grey[600],
            //
            borderRadius: 2,
            bottom: 8,
            height: 4,
          },
          [`& .${tabsClasses.flexContainer} > a`]: {
            minWidth: 0,
            paddingX: 0,
            transition: theme.transitions.create("color"),
          },
        })}
      >
        <NavTab value="/" to="/" label="Home" />
        <NavTab value="/transactions" to="/transactions" label="Transactions" />
        <NavTab value="/audit-logs" to="/audit-logs" label="Audit logs" />
        <NavTab value="/import-data" to="/import-data" label="Import data" />
      </Tabs>
    </>
  )
}
