import { UnfoldMore } from "@mui/icons-material"
import { Button, Stack, Tooltip, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { useState } from "react"
import { useBoolean } from "src/hooks/useBoolean"
import { $activeAccount } from "src/stores/account-store"

import { AccountAvatar } from "../AccountAvatar"
import { AddAccountDialog } from "../AccountPicker/AddAccount"
import { Truncate } from "../Truncate"
import { AccountPicker } from "./AccountPicker"

export function AccountPickerButton() {
  const activeAccount = useStore($activeAccount)

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>()
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(undefined)
  }
  const open = Boolean(anchorEl)

  const { value: addAccountOpen, toggle: toggleAddAccount } = useBoolean(false)

  return (
    <>
      <Tooltip title="Account">
        <Button
          onClick={handleClick}
          variant="outlined"
          color="secondary"
          sx={{
            justifyContent: "space-between",
            maxWidth: { sm: 220, xs: 140 },
            minWidth: { sm: 220 },
            paddingX: 1,
            paddingY: 0.25,
          }}
        >
          <Stack direction="row" alignItems="center" sx={{ overflow: "hidden" }}>
            <AccountAvatar alt={activeAccount} size="small" />
            <Typography
              variant="subtitle1"
              letterSpacing="0.025rem"
              marginX={1}
              component={Truncate}
            >
              {activeAccount}
            </Typography>
          </Stack>
          <UnfoldMore fontSize="small" sx={{ flex: "0 0 20px" }} />
        </Button>
      </Tooltip>
      <AccountPicker
        open={open}
        anchorEl={anchorEl}
        handleClose={handleClose}
        toggleAddAccount={toggleAddAccount}
      />
      <AddAccountDialog open={addAccountOpen} toggleOpen={toggleAddAccount} />
    </>
  )
}
