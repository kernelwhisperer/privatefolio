import { Add, PersonRemoveRounded, RestartAltRounded } from "@mui/icons-material"
import { Divider, ListItemAvatar, ListItemText, MenuItem } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useConfirm } from "src/hooks/useConfirm"
import { $accounts, $activeAccount, $activeIndex } from "src/stores/account-store"
import { enqueueDeleteAccount, enqueueResetAccount } from "src/utils/common-tasks"

import { AccountAvatar } from "../AccountAvatar"
import { NavMenuItem } from "../NavMenuItem"

type AccountPickerContentsProps = {
  onClose: () => void
  toggleAddAccount: () => void
}

export function AccountPickerContents(props: AccountPickerContentsProps) {
  const { toggleAddAccount, onClose } = props

  const accounts = useStore($accounts)

  const location = useLocation()
  const { pathname } = location
  const currentPath = pathname.split("/").slice(3).join("/")

  const confirm = useConfirm()
  const activeAccount = useStore($activeAccount)
  const navigate = useNavigate()

  return (
    <>
      {accounts.map((x, index) => (
        <NavMenuItem
          key={x}
          value={x}
          className={activeAccount === x ? "Mui-selected" : undefined}
          onClick={() => {
            $activeAccount.set(x)
            onClose()
          }}
          to={`/u/${index}/${currentPath}`}
          label={x}
          avatar={<AccountAvatar alt={x} />}
          aria-label={`Switch to account ${index}`}
        />
      ))}
      <Divider />
      <MenuItem
        aria-label="Add account"
        onClick={() => {
          toggleAddAccount()
          onClose()
        }}
      >
        <ListItemAvatar>
          <Add fontSize="medium" />
        </ListItemAvatar>
        <ListItemText primary="Add account" />
      </MenuItem>
      <MenuItem
        aria-label="Reset account"
        onClick={async () => {
          const { confirmed } = await confirm({
            content: (
              <>
                This action is permanent. All the data belonging to {activeAccount} will be lost.
                <br />
                <br />
                Are you sure you wish to continue?
              </>
            ),
            title: "Reset account",
            variant: "warning",
          })
          if (confirmed) {
            enqueueResetAccount()
            navigate(`/u/${$activeIndex.get()}/import-data`)
            onClose()
          }
        }}
      >
        <ListItemAvatar>
          <RestartAltRounded fontSize="medium" />
        </ListItemAvatar>
        <ListItemText>Reset account</ListItemText>
      </MenuItem>
      <MenuItem
        aria-label="Delete account"
        disabled={accounts.length === 1}
        onClick={async () => {
          const { confirmed } = await confirm({
            content: (
              <>
                This action is permanent. All the data belonging to {activeAccount} will be lost.
                <br />
                <br />
                Are you sure you wish to continue?
              </>
            ),
            title: "Delete account",
            variant: "warning",
          })
          if (confirmed) {
            enqueueDeleteAccount()
            onClose()
          }
        }}
      >
        <ListItemAvatar>
          <PersonRemoveRounded fontSize="medium" />
        </ListItemAvatar>
        <ListItemText>Delete account</ListItemText>
      </MenuItem>
    </>
  )
}
