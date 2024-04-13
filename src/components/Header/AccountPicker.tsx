import { Menu, MenuList, styled, SwipeableDrawer, Typography, useMediaQuery } from "@mui/material"
import { grey } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
import { proxy } from "comlink"
import React, { useEffect } from "react"
import { $accountReset, $activeAccount } from "src/stores/account-store"
import { computeMetadata, computeMetadataDebounced } from "src/stores/metadata-store"
import { noop } from "src/utils/utils"
import { clancy } from "src/workers/remotes"

import { AccountPickerContents } from "./AccountPickerContents"

const Puller = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.mode === "light" ? grey[300] : grey[900],
  borderRadius: 3,
  height: 6,
  left: "calc(50% - 15px)",
  position: "absolute",
  top: 8,
  width: 30,
}))

export interface AccountPickerProps {
  anchorEl?: HTMLButtonElement
  handleClose: () => void
  open: boolean
  toggleAddAccount: () => void
}

export function AccountPicker(props: AccountPickerProps) {
  const { open, anchorEl, handleClose, toggleAddAccount } = props

  const activeAccount = useStore($activeAccount)
  const accountReset = useStore($accountReset)

  useEffect(() => {
    computeMetadata()
    const unsubscribePromise = clancy.subscribeToAuditLogs(
      proxy(computeMetadataDebounced),
      activeAccount
    )
    const unsubscribe2Promise = clancy.subscribeToAssets(
      proxy(computeMetadataDebounced),
      activeAccount
    )

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        unsubscribe()
      })
      unsubscribe2Promise.then((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [accountReset, activeAccount])

  const isMobile = useMediaQuery("(max-width: 599px)")

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={handleClose}
        onOpen={noop}
        disableSwipeToOpen
        sx={{
          "& .MuiPaper-root": {
            borderTopLeftRadius: "25px",
            borderTopRightRadius: "25px",
          },
        }}
      >
        <Puller />
        <Typography
          variant="subtitle1"
          letterSpacing="0.025rem"
          align="center"
          sx={{ marginTop: 2 }}
        >
          Accounts
        </Typography>
        <MenuList sx={{ paddingX: 2, paddingY: 1 }}>
          <AccountPickerContents toggleAddAccount={toggleAddAccount} onClose={handleClose} />
        </MenuList>
      </SwipeableDrawer>
    )
  }

  return (
    <Menu
      keepMounted
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        horizontal: "right",
        vertical: "bottom",
      }}
      transformOrigin={{
        horizontal: "right",
        vertical: "top",
      }}
      sx={{
        marginTop: 0.5,
        visibility: open ? "visible" : "hidden", // FIXME why is this needed?
      }}
      slotProps={{ paper: { sx: { width: 280 } } }}
    >
      <AccountPickerContents toggleAddAccount={toggleAddAccount} onClose={handleClose} />
    </Menu>
  )
}
