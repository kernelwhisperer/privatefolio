import { CalculateOutlined, MemoryRounded, MoreHoriz } from "@mui/icons-material"
import BackupRoundedIcon from "@mui/icons-material/BackupRounded"
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded"
import { IconButton, ListItemAvatar, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material"
import React from "react"
import { requestFile } from "src/utils/utils"

import {
  enqueueBackup,
  enqueueIndexDatabase,
  enqueueRecomputeBalances,
  enqueueRecomputeNetworth,
  enqueueRestore,
} from "../../utils/common-tasks"

export function ImportDataActions() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title="Actions">
        <IconButton color="secondary" onClick={handleClick}>
          <MoreHoriz fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <MenuItem
          dense
          onClick={() => {
            enqueueBackup()
            handleClose()
          }}
        >
          <ListItemAvatar>
            <BackupRoundedIcon fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Backup</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={async () => {
            const files = await requestFile([".zip"], false)
            handleClose()
            enqueueRestore(files[0])
          }}
        >
          <ListItemAvatar>
            <RestoreRoundedIcon fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Restore</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueRecomputeBalances()
            handleClose()
          }}
        >
          <ListItemAvatar>
            <CalculateOutlined fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Recompute balances</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueRecomputeNetworth()
            handleClose()
          }}
        >
          <ListItemAvatar>
            <CalculateOutlined fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Recompute networth</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            enqueueIndexDatabase()
            handleClose()
          }}
        >
          <ListItemAvatar>
            <MemoryRounded fontSize="small" />
          </ListItemAvatar>
          <ListItemText>Index database</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
