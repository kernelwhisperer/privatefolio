import { Paper, PaperProps, Stack, Typography, useTheme } from "@mui/material"
import { proxy } from "comlink"
import React, { useRef, useState } from "react"
import { ConfirmDialogContextType, useConfirm } from "src/hooks/useConfirm"
import { ParserContextFn } from "src/interfaces"
import { $activeAccount } from "src/stores/account-store"
import { formatCamelCase } from "src/utils/utils"

import { enqueueTask, TaskPriority } from "../stores/task-store"
import { handleAuditLogChange } from "../utils/common-tasks"
import { clancy } from "../workers/remotes"
import { AddressInputUncontrolled } from "./AddressInput"
import { SectionTitle } from "./SectionTitle"

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

  const confirm = useConfirm()

  const handleFileUpload = async (file: File) => {
    // TODO now the UI "freezes" until the file is imported

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
        const { metadata } = await clancy.addFileImport(
          clone,
          progress,
          $activeAccount.get(),
          proxy(createParserContextFn(confirm, file))
        )
        if (metadata.logs > 0) {
          handleAuditLogChange()
        }
      },
      name: `Import file`,
      priority: TaskPriority.VeryHigh,
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
            Drag and drop your <code>.csv</code> files here or <u>browse files</u> from your
            computer.
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

function createParserContextFn(confirm: ConfirmDialogContextType["confirm"], file: File) {
  const possibleUserAddress = file.name.match(/0x[a-fA-F0-9]{40}/)?.[0]

  return async function getParserContext(requirements: string[]) {
    const { confirmed, event } = await confirm({
      content: (
        <>
          Before this file import can be processed you need to fill the following form.
          <br />
          <br />
          {requirements.map((requirement, index) => {
            return (
              <div key={index}>
                <SectionTitle>{formatCamelCase(requirement)}</SectionTitle>
                <AddressInputUncontrolled
                  variant="outlined"
                  fullWidth
                  initialValue={possibleUserAddress}
                  size="small"
                  required
                  name={requirement}
                />
              </div>
            )
          })}
        </>
      ),
      title: "Import file needs extra information",
    })

    if (confirmed && event) {
      const formData = new FormData(event.target as HTMLFormElement)
      const parserContext = requirements.reduce(
        (acc, requirement) => ({
          ...acc,
          [requirement]: formData.get(requirement),
        }),
        {} as ReturnType<ParserContextFn>
      )

      return parserContext
    }

    throw new Error("User did not provide necessary information.")
  } as ParserContextFn
}
