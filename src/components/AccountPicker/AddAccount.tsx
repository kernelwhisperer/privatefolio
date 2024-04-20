import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { FormEvent, useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { $accounts, $activeAccount } from "src/stores/account-store"

import { SectionTitle } from "../SectionTitle"

interface AddAccountDialogProps {
  open: boolean
  toggleOpen: () => void
}

export function AddAccountDialog(props: AddAccountDialogProps) {
  const { open, toggleOpen } = props
  const accounts = useStore($accounts)
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()

      const newAcc = name.trim()
      if (newAcc === "") {
        setError("This field cannot be empty")
        return
      }

      const exists = accounts.find((x) => x === newAcc)
      if (exists) {
        setError("This name is already being used")
        return
      }

      $accounts.set([...accounts, newAcc])
      toggleOpen()
      setError("")
      setName("")
      navigate(`/u/${accounts.length}/import-data`)
      // HACK: this is a hack to make sure the active account is set after the navigation
      setTimeout(() => {
        $activeAccount.set(newAcc)
      }, 0)
    },
    [accounts, name, toggleOpen, navigate]
  )

  return (
    <Dialog open={open} onClose={toggleOpen}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <span>Add Account</span>
        </DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <div>
            <SectionTitle>Name *</SectionTitle>
            <TextField
              name="Account name"
              autoComplete="off"
              autoFocus
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
          <Button onClick={toggleOpen} color="secondary" sx={{ paddingX: 2 }}>
            Cancel
          </Button>
          <Button type="submit" color="primary" sx={{ paddingX: 2 }}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
