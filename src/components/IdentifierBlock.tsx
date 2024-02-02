import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material"
import React from "react"
import { MonoFont } from "src/theme"

import { Truncate } from "./Truncate"

type IdentifierBlockProps = {
  id: string
  size?: "small" | "medium"
}

export function IdentifierBlock(props: IdentifierBlockProps) {
  const { id, size } = props

  return (
    <Tooltip
      // leaveDelay={100000000}
      title={
        <Stack alignItems="center">
          <Box sx={{ fontFamily: MonoFont, maxWidth: "100%" }}>{id}</Box>
          <span className="secondary">(copy to clipboard)</span>
        </Stack>
      }
    >
      <Chip
        size={size}
        onClick={() => {
          navigator.clipboard.writeText(id)
        }}
        label={
          <Truncate>
            <Typography fontFamily={MonoFont} variant="inherit" component="span">
              {id}
            </Typography>
          </Truncate>
        }
        // onDelete={() => {
        //   navigator.clipboard.writeText(String(id))
        // }}
        // deleteIcon={
        //   <Tooltip title="Copy to clipboard">
        //     <ContentCopyRounded />
        //   </Tooltip>
        // }
      />
    </Tooltip>
  )
}
