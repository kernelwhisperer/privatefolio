import { Add } from "@mui/icons-material"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import { proxy } from "comlink"
import React, { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useBoolean } from "src/hooks/useBoolean"
import { $accounts, $activeAccount } from "src/stores/account-store"
import { computeMetadata, computeMetadataDebounced } from "src/stores/metadata-store"
import { clancy } from "src/workers/remotes"

import { AccountAvatar } from "../AccountAvatar"
import { NavMenuItem } from "../NavMenuItem"
import { SectionTitle } from "../SectionTitle"

export function AccountPicker() {
  const accounts = useStore($accounts)
  const activeAccount = useStore($activeAccount)
  const { value: open, toggle: toggleOpen } = useBoolean(false)

  const location = useLocation()
  const { pathname } = location
  const currentPath = pathname.split("/").slice(3).join("/")

  useEffect(() => {
    computeMetadata()
    const unsubscribePromise = clancy.subscribeToAuditLogs(
      proxy(computeMetadataDebounced),
      activeAccount
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [activeAccount])

  const { value: modalOpen, toggle: toggleModalOpen } = useBoolean(false)
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const handleCreate = useCallback(() => {
    const nameTrimmed = name.trim()
    if (nameTrimmed === "") {
      setError("This field cannot be empty")
      return
    }

    const exists = accounts.find((x) => x === nameTrimmed)
    if (exists) {
      setError("This name is already being used")
      return
    }

    $accounts.set([...accounts, nameTrimmed])
    toggleModalOpen()
    setError("")
    setName("")
    navigate("/u/" + accounts.length)
    // HACK: this is a hack to make sure the active account is set after the navigation
    setTimeout(() => {
      $activeAccount.set(nameTrimmed)
    }, 0)
  }, [accounts, name, toggleModalOpen, navigate])

  return (
    <Box>
      <Tooltip title="Accounts">
        <IconButton onClick={toggleOpen} sx={{ marginRight: -1 }}>
          <AccountAvatar alt={activeAccount} size="small" />
        </IconButton>
      </Tooltip>
      <Select
        open={open}
        onClose={toggleOpen}
        onOpen={toggleOpen}
        value={activeAccount}
        IconComponent={() => false}
        input={
          <InputBase sx={{ height: 36, position: "absolute", visibility: "hidden", width: 16 }} />
        }
        MenuProps={{
          anchorOrigin: {
            horizontal: "right",
            vertical: "bottom",
          },
          transformOrigin: {
            horizontal: "right",
            vertical: "top",
          },
        }}
      >
        {accounts.map((x, index) => (
          <NavMenuItem
            value={x}
            key={x}
            onClick={() => {
              $activeAccount.set(x)
            }}
            to={`/u/${index}/${currentPath}`}
            label={x}
            avatar={<AccountAvatar alt={x} src={x} />}
          />
        ))}
        <MenuItem sx={{ minWidth: 240 }} onClick={toggleModalOpen}>
          <ListItemAvatar
            sx={{
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
              marginRight: 2,
              minWidth: 28,
            }}
          >
            <Add fontSize="medium" color="secondary" />
          </ListItemAvatar>
          <ListItemText primary={"Add account"} />
        </MenuItem>
      </Select>

      {/* <Portal>
        <Drawer
          // variant="permanent"
          anchor="left"
          keepMounted
          open={false} // </>={open}
          // transitionDuration={500}
          // TODO this should have a delay
          // onClose={toggleOpen}
          PaperProps={{
            sx: {
              height: "fit-content",
              // left: 4,
              marginY: "auto",
              maxHeight: 500,
              paddingX: 1.5,
              paddingY: 2,
              top: 124,
            },
          }}
        >
          <Stack gap={1}>
            {accounts.map((x) => (
              <Button
                key={x}
                sx={{
                  minWidth: "unset",
                  padding: 0,
                }}
                onClick={() => {
                  $activeAccount.set(x)
                }}
              >
                <Avatar
                  sx={(theme) => ({
                    "&:hover": {
                      borderRadius: 2,
                    },
                    // borderRadius: activeAccount === x ? 2 : undefined,
                    height: 48,
                    transition: theme.transitions.create("border-radius"),
                    width: 48,
                  })}
                />
              </Button>
            ))}
          </Stack>
        </Drawer>
      </Portal> */}
      <Dialog open={modalOpen} onClose={toggleModalOpen}>
        <DialogTitle>
          <span>Add Account</span>
        </DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <div>
            <SectionTitle>Name *</SectionTitle>
            <TextField
              variant="outlined"
              fullWidth
              size="small"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={!!error}
              helperText={error}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleModalOpen} color="secondary" sx={{ paddingX: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleCreate} color="primary" sx={{ paddingX: 2 }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
