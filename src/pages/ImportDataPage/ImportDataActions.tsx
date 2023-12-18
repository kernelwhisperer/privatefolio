import {
  CalculateOutlined,
  CurrencyExchange,
  MemoryRounded,
  MoreHoriz,
  Storage,
} from "@mui/icons-material"
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"

import { useConfirm } from "../../hooks/useConfirm"
import { $devMode } from "../../stores/app-store"
import { enqueueTask, TaskPriority } from "../../stores/task-store"
import {
  enqueueComputeBalances,
  enqueueFetchPrices,
  enqueueIndexDatabase,
} from "../../utils/common-tasks"
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

  const devMode = useStore($devMode)

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
            enqueueIndexDatabase()
            handleClose()
          }}
        >
          <ListItemIcon>
            <MemoryRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>Index database</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueComputeBalances()
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
            enqueueFetchPrices()
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
            const { confirmed, extraAnswers } = await confirm({
              content: (
                <>
                  This action is permanent. All data will be lost.
                  <br />
                  Are you sure you wish to continue?
                </>
              ),
              extraQuestions: ["Remove daily price data too."],
              title: "Wipe database",
              variant: "warning",
            })
            if (confirmed) {
              enqueueTask({
                description: "Removing all data saved on disk.",
                function: async () => {
                  await clancy.resetDatabase(extraAnswers[0])
                },
                name: "Wipe database",
                priority: TaskPriority.High,
              })
              handleClose()
            }
          }}
        >
          <ListItemIcon>
            <Storage fontSize="small" />
          </ListItemIcon>
          <ListItemText>Wipe database</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
