import { DataArrayRounded } from "@mui/icons-material"
import { Link as MuiLink, Paper, Stack, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { Link } from "react-router-dom"
import { $activeIndex } from "src/stores/account-store"

export function NoDataCard() {
  const activeIndex = useStore($activeIndex)

  return (
    <Paper sx={{ padding: 4 }}>
      <Typography color="text.secondary" variant="body2" component="div">
        <Stack alignItems="center">
          <DataArrayRounded sx={{ height: 64, width: 64 }} />
          <span>Nothing to see here...</span>
          <MuiLink
            color="inherit"
            sx={{ marginTop: 4 }}
            component={Link}
            to={`/u/${activeIndex}/import-data`}
            underline="hover"
          >
            Visit <u>Import data</u> to get started.
          </MuiLink>
        </Stack>
      </Typography>
    </Paper>
  )
}
