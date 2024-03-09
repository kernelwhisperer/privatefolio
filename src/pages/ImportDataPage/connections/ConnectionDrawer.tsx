import { CloseRounded } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import {
  Drawer,
  DrawerProps,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { isAddress } from "ethers"
import React, { useCallback, useEffect, useState } from "react"
import { $activeAccount } from "src/stores/account-store"
import { enqueueSyncConnection, handleAuditLogChange } from "src/utils/common-tasks"
import { clancy } from "src/workers/remotes"

import { AddressInput } from "../../../components/AddressInput"
import { SectionTitle } from "../../../components/SectionTitle"
import { Platform } from "../../../interfaces"
import { CONNECTIONS, PLATFORMS_META } from "../../../settings"
import { PopoverToggleProps } from "../../../stores/app-store"

export function ConnectionDrawer({ open, toggleOpen, ...rest }: DrawerProps & PopoverToggleProps) {
  const [loading, setLoading] = useState(false)

  const [label, setLabel] = useState("")
  const [address, setAddress] = useState("")
  const [platform, setPlatform] = useState<Platform>("ethereum")

  useEffect(() => {
    setLoading(false)
    setAddress("")
    setPlatform("ethereum")
  }, [open])

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const isValidAddress = address && isAddress(address)
      if (!isValidAddress) return

      setLoading(true)

      clancy
        .addConnection({ address, label, platform }, $activeAccount.get())
        .then((connection) => {
          toggleOpen()
          enqueueSyncConnection(connection)
          handleAuditLogChange()
        })
        .catch(() => {
          setLoading(false)
        })
    },
    [address, platform, label, toggleOpen]
  )

  return (
    <Drawer open={open} onClose={toggleOpen} {...rest}>
      <form onSubmit={handleSubmit}>
        <Stack paddingX={2} paddingY={1} gap={4} sx={{ overflowX: "hidden", width: 359 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" letterSpacing="0.025rem">
              Add connection
            </Typography>
            <IconButton onClick={toggleOpen} edge="end" color="secondary">
              <CloseRounded fontSize="small" />
            </IconButton>
          </Stack>
          <div>
            <SectionTitle>Platform</SectionTitle>
            <Select
              variant="outlined"
              fullWidth
              size="small"
              value={platform}
              onChange={(event) => setPlatform(event.target.value as Platform)}
            >
              {Object.keys(CONNECTIONS).map((x) => (
                <MenuItem key={x} value={x}>
                  <ListItemText primary={PLATFORMS_META[x].name} />
                </MenuItem>
              ))}
            </Select>
          </div>
          <div>
            <SectionTitle>Address *</SectionTitle>
            <AddressInput
              value={address}
              onChange={setAddress}
              variant="outlined"
              fullWidth
              size="small"
              required
            />
          </div>
          <div>
            <SectionTitle>Label</SectionTitle>
            <TextField
              variant="outlined"
              fullWidth
              size="small"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </div>
          <div>
            <LoadingButton variant="contained" type="submit" loading={loading}>
              Add connection
            </LoadingButton>
          </div>
        </Stack>
      </form>
    </Drawer>
  )
}
