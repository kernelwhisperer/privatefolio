import {
  CalculateOutlined,
  CurrencyExchange,
  MemoryRounded,
  MoreHoriz,
  Storage,
} from "@mui/icons-material"
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material"
import React from "react"

import { useConfirm } from "../../hooks/useConfirm"
import { enqueueTask, TaskPriority } from "../../stores/task-store"
import {
  enqueueFetchPrices,
  enqueueIndexDatabase,
  enqueueRecomputeBalances,
  enqueueRecomputeNetworth,
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

  // const debugMode = useStore($debugMode)

  return (
    <>
      <Tooltip title="Database actions">
        <IconButton color="secondary" onClick={handleClick} sx={{ marginRight: -1 }}>
          <MoreHoriz fontSize="small" />
        </IconButton>
      </Tooltip>
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
            enqueueRecomputeBalances()
            handleClose()
          }}
        >
          <ListItemIcon>
            <CalculateOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Recompute balances</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueRecomputeNetworth()
            handleClose()
          }}
        >
          <ListItemIcon>
            <CalculateOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Recompute networth</ListItemText>
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
                  if (extraAnswers[0]) {
                    await clancy.resetCoreDatabase()
                  }
                  await clancy.resetAccount("main")
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
