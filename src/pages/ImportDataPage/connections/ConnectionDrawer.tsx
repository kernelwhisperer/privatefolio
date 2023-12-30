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
import { enqueueSyncConnection } from "src/utils/common-tasks"
import { clancy } from "src/workers/remotes"

import { AddressInput } from "../../../components/AddressInput"
import { SectionTitle } from "../../../components/SectionTitle"
import { StaggeredList } from "../../../components/StaggeredList"
import { Integration } from "../../../interfaces"
import { CONNECTIONS, INTEGRATIONS } from "../../../settings"
import { PopoverToggleProps } from "../../../stores/app-store"

export function ConnectionDrawer({ open, toggleOpen, ...rest }: DrawerProps & PopoverToggleProps) {
  const [loading, setLoading] = useState(false)

  const [label, setLabel] = useState("")
  const [address, setAddress] = useState("")
  const [integration, setIntegration] = useState<Integration>("ethereum")

  useEffect(() => {
    setLoading(false)
    setAddress("")
    setIntegration("ethereum")
  }, [open])

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const isValidAddress = address && isAddress(address)
      if (!isValidAddress) return

      setLoading(true)

      clancy
        .addConnection({ address, integration, label })
        .then((connection) => {
          toggleOpen()
          enqueueSyncConnection(connection)
        })
        .catch(() => {
          setLoading(false)
        })
    },
    [address, integration, label, toggleOpen]
  )

  return (
    <Drawer open={open} onClose={toggleOpen} {...rest}>
      <form onSubmit={handleSubmit}>
        <StaggeredList
          paddingX={2}
          paddingY={1}
          gap={4}
          show={open}
          secondary
          sx={{ overflowX: "hidden", width: 359 }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" letterSpacing="0.025rem">
              Add connection
            </Typography>
            <IconButton onClick={toggleOpen} edge="end" color="secondary">
              <CloseRounded fontSize="small" />
            </IconButton>
          </Stack>
          <div>
            <SectionTitle>Integration</SectionTitle>
            <Select
              variant="outlined"
              fullWidth
              size="small"
              value={integration}
              onChange={(event) => setIntegration(event.target.value as Integration)}
            >
              {Object.keys(CONNECTIONS).map((x) => (
                <MenuItem key={x} value={x}>
                  <ListItemText primary={INTEGRATIONS[x]} />
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
          <LoadingButton variant="contained" type="submit" loading={loading}>
            Add connection
          </LoadingButton>
        </StaggeredList>
      </form>
    </Drawer>
  )
}
