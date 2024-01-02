import { Avatar, Button, Drawer, IconButton, Portal, Stack, Tooltip } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { $accounts, $activeAccount } from "src/stores/account-store"

import { AccountAvatar } from "../AccountAvatar"

export function AccountPicker() {
  const accounts = useStore($accounts)
  const activeAccount = useStore($activeAccount)

  return (
    <>
      <Tooltip title={activeAccount}>
        <IconButton
          sx={{
            "&:hover": {
              transform: "rotate(-30deg)",
            },
            marginRight: -1,
            transition: "transform 0.33s",
          }}
        >
          <AccountAvatar alt={"0xf98C96B5d10faAFc2324847c82305Bd5fd7E5ad3"} size="small" />
        </IconButton>
      </Tooltip>
      <Portal>
        <Drawer
          variant="permanent"
          anchor="left"
          keepMounted
          open // </>={open}
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
      </Portal>
    </>
  )
}
