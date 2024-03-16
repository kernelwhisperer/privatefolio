import {
  AssignmentOutlined,
  AttachMoneyRounded,
  DeleteForever,
  MoreHoriz,
  VisibilityOffRounded,
  VisibilityRounded,
} from "@mui/icons-material"
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { $hideUnlisted, $hideUnlistedMap } from "src/stores/account-settings-store"
import { $activeAccount } from "src/stores/account-store"
import { $debugMode } from "src/stores/app-store"

import { useConfirm } from "../../hooks/useConfirm"
import { enqueueTask, TaskPriority } from "../../stores/task-store"
import {
  enqueueDeleteAssetInfos,
  enqueueFetchAssetInfos,
  enqueueFetchPrices,
} from "../../utils/common-tasks"
import { clancy } from "../../workers/remotes"

export function AssetsActions() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const confirm = useConfirm()

  const debugMode = useStore($debugMode)
  const hideUnlisted = useStore($hideUnlisted)

  return (
    <Stack direction="row" gap={1}>
      <Tooltip title={hideUnlisted ? "Show unlisted assets" : "Hide unlisted assets"}>
        <IconButton
          color="secondary"
          onClick={() => {
            $hideUnlistedMap.setKey($activeAccount.get(), String(!hideUnlisted))
          }}
          sx={{ marginRight: -1 }}
        >
          {hideUnlisted ? (
            <VisibilityOffRounded fontSize="small" />
          ) : (
            <VisibilityRounded fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title="Database actions">
        <IconButton color="secondary" onClick={handleClick} sx={{ marginRight: -1 }}>
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
            enqueueFetchAssetInfos()
            handleClose()
          }}
        >
          <ListItemIcon>
            <AssignmentOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Fetch asset infos</ListItemText>
        </MenuItem>
        {debugMode && (
          <MenuItem
            dense
            onClick={() => {
              enqueueDeleteAssetInfos()
              handleClose()
            }}
          >
            <ListItemIcon>
              <DeleteForever fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete asset infos</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          dense
          onClick={() => {
            enqueueFetchPrices()
            handleClose()
          }}
        >
          <ListItemIcon>
            <AttachMoneyRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>Fetch asset prices</ListItemText>
        </MenuItem>
        {debugMode && (
          <MenuItem
            dense
            onClick={async () => {
              const { confirmed } = await confirm({
                content: (
                  <>
                    Asset prices are stored in a separate database, do not contain any sensitive
                    information and are stored on disk in order to speed things up.
                    <br />
                    <br />
                    Are you sure you wish to continue?
                  </>
                ),
                title: "Delete asset prices",
              })
              if (confirmed) {
                enqueueTask({
                  description: "Removing asset price data, which is saved on disk.",
                  function: async () => {
                    await clancy.resetCoreDatabase()
                  },
                  name: "Delete asset prices",
                  priority: TaskPriority.High,
                })
                handleClose()
              }
            }}
          >
            <ListItemIcon>
              <DeleteForever fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete asset prices</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Stack>
  )
}
