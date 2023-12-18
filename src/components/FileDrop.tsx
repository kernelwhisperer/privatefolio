import { Paper, PaperProps, Stack, Typography, useTheme } from "@mui/material"
import React, { useRef, useState } from "react"

import { enqueueTask } from "../stores/task-store"
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

  const handleFileUpload = (file: File) => {
    enqueueTask({
      description: `Importing file ${file.name}`,
      function: async () => {
        const _id = await clancy.addFileImport(file)
        enqueueTask({
          description: `Extracting audit logs from ${file.name}`,
          function: () => clancy.processFileImport(_id, file),
          name: `Extract audit logs`,
          priority: 5,
        })
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
