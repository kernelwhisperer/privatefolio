import { CloseRounded } from "@mui/icons-material"
import {
  Button,
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
import React, { useState } from "react"

import { AddressInput } from "../../components/AddressInput"
import { SectionTitle } from "../../components/SectionTitle"
import { StaggeredList } from "../../components/StaggeredList"
import { Integration } from "../../interfaces"
import { INTEGRATIONS } from "../../settings"
import { PopoverToggleProps } from "../../stores/app-store"

export function ConnectionDrawer({ open, toggleOpen, ...rest }: DrawerProps & PopoverToggleProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toggleOpen()
  }

  const [address, setAddress] = useState("")
  const [integration, setIntegration] = useState<Integration>("ethereum")

  return (
    <Drawer open={open} onClose={toggleOpen} {...rest}>
      <form onSubmit={handleSubmit}>
        <StaggeredList
          padding={2}
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
              {Object.keys(INTEGRATIONS).map((x) => (
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
            <TextField variant="outlined" fullWidth size="small" />
          </div>

          <Button variant="contained" type="submit">
            Submit
          </Button>
        </StaggeredList>
      </form>
    </Drawer>
  )
}
