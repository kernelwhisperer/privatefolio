import { DataArrayRounded } from "@mui/icons-material"
import { Box, Button, Stack, Typography } from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { Link } from "react-router-dom"
import { $activeIndex } from "src/stores/account-store"

export function NoDataButton() {
  const activeIndex = useStore($activeIndex)

  return (
    <Button sx={{ padding: 4 }} component={Link} to={`/u/${activeIndex}/import-data`}>
      <Typography color="text.secondary" variant="body2" component="div">
        <Stack alignItems="center">
          <DataArrayRounded sx={{ height: 64, width: 64 }} />
          <span>No records could be found...</span>
          <Box sx={{ marginTop: 2 }}>
            Visit <u>Import data</u> to get started.
          </Box>
        </Stack>
      </Typography>
    </Button>
  )
}
