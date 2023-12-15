import {
  CalculateOutlined,
  CurrencyExchange,
  MemoryRounded,
  MoreHoriz,
  Storage,
} from "@mui/icons-material"
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material"
import React from "react"

import { useConfirm } from "../../hooks/useConfirm"
import { $filterOptionsMap } from "../../stores/metadata-store"
import { enqueueTask, TaskPriority } from "../../stores/task-store"
import { clancy } from "../../workers/remotes"

export function ImportDataActions() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const confirm = useConfirm()

  return (
    <>
      <IconButton color="secondary" onClick={handleClick} sx={{ marginRight: -2 }}>
        <MoreHoriz fontSize="small" />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <MenuItem
          dense
          onClick={() => {
            enqueueTask({
              description: "Recomputing indexes for all audit logs.",
              function: async () => {
                await clancy.indexAuditLogs()
              },
              name: "Recompute audit logs indexes",
              priority: TaskPriority.Low,
            })
            handleClose()
          }}
        >
          <ListItemIcon>
            <MemoryRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>Recompute indexes</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueTask({
              description: "Recomputing balances for all assets.",
              determinate: true,
              function: async (progress, signal) => {
                await clancy.computeBalances(progress, signal)
              },
              name: "Compute balances",
              priority: TaskPriority.Low,
            })
            handleClose()
          }}
        >
          <ListItemIcon>
            <CalculateOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Compute balances</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueTask({
              description: "Fetching price data for all assets.",
              determinate: true,
              function: async (progress, signal) => {
                await clancy.fetchDailyPrices($filterOptionsMap.get().symbol, progress, signal)
              },
              name: "Fetch asset prices",
              priority: TaskPriority.Low,
            })
            handleClose()
          }}
        >
          <ListItemIcon>
            <CurrencyExchange fontSize="small" />
          </ListItemIcon>
          <ListItemText>Fetch asset prices</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={async () => {
            const confirmed = await confirm(
              "Reset database",
              "This action is permanent. All data will be lost. Are you sure you wish to continue?",
              "warning"
            )
            if (confirmed) {
              enqueueTask({
                description: "Removing absolutely all data saved on disk.",
                function: async () => {
                  await clancy.resetDatabase()
                },
                name: "Reset database",
                priority: TaskPriority.High,
              })
              handleClose()
            }
          }}
        >
          <ListItemIcon>
            <Storage fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset database</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
