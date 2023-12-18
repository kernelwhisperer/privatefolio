import { DataArrayRounded } from "@mui/icons-material"
import { Link as MuiLink, Paper, Stack, Typography } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"

export function NoDataCard() {
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
            to="/import-data"
            underline="hover"
          >
            Visit <u>Import data</u> to get started.
          </MuiLink>
        </Stack>
      </Typography>
    </Paper>
  )
}
