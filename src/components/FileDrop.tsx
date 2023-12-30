import { Paper, PaperProps, Stack, Typography, useTheme } from "@mui/material"
import React, { useRef, useState } from "react"

import { enqueueTask } from "../stores/task-store"
import { handleAuditLogChange } from "../utils/common-tasks"
import { clancy } from "../workers/remotes"

export function FileDrop(props: PaperProps & { defaultBg?: string }) {
  const theme = useTheme()

  const { children, defaultBg = theme.palette.background.paper, sx, ...rest } = props

  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileUpload = async (file: File) => {
    // TODO now the UI does not changing until the file is imported

    // must clone the file, otherwise multiple upload doesn't work on mobile
    // https://github.com/GoogleChrome/developer.chrome.com/issues/2563#issuecomment-1464499084
    const buffer = await file.arrayBuffer()
    const clone = new File([buffer], file.name, {
      lastModified: file.lastModified,
      type: file.type,
    })

    enqueueTask({
      description: `Importing "${file.name}".`,
      determinate: true,
      function: async (progress) => {
        await clancy.addFileImport(clone, progress)
        handleAuditLogChange()
      },
      name: `Import file`,
      priority: 8,
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(handleFileUpload)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(handleFileUpload)
    }
  }

  return (
    <Paper
      variant="outlined"
      elevation={0}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      sx={{
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
        backgroundColor: dragOver ? theme.palette.action.hover : defaultBg,
        borderStyle: "dashed",
        // borderWidth: 2,
        color: theme.palette.text.primary,
        cursor: "pointer",
        padding: 1,
        textAlign: "center",
        transition: theme.transitions.create("background-color", {
          duration: theme.transitions.duration.shortest,
        }),
        ...sx,
      }}
      {...rest}
    >
      <Typography color="text.secondary" variant="body2" component="div">
        <Stack alignItems="center" gap={4}>
          {children}
          <span>
            Drag and drop your <code>.csv</code> files here or{" "}
            <u>browse files from your computer</u>.
          </span>
        </Stack>
      </Typography>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        accept=".csv"
        multiple
      />
    </Paper>
  )
}
