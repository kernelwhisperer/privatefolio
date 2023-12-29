import { ListItemText, MenuItem, MenuItemProps } from "@mui/material"
import React from "react"
import { NavLink } from "react-router-dom"

export function NavMenuItem({
  label,
  ...props
}: MenuItemProps<typeof NavLink> & { label: string; value: string }) {
  return (
    <MenuItem sx={{ minWidth: 240 }} component={NavLink} LinkComponent={NavLink} {...props}>
      <ListItemText primary={label} />
    </MenuItem>
  )
}
