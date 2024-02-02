import { CircularProgress, Paper, PaperProps, Stack, Typography, useTheme } from "@mui/material"
import { proxy } from "comlink"
import React, { useCallback, useRef, useState } from "react"
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

  const [cloning, setCloning] = useState(false)
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

  const handleFileUpload = useCallback(
    async (file: File) => {
      enqueueTask({
        description: `Importing "${file.name}".`,
        determinate: true,
        function: async (progress) => {
          const { metadata } = await clancy.addFileImport(
            file,
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
    },
    [confirm]
  )

  // ProTip: this callback cannot be async because it doesn't work on mobile
  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragOver(false)
      const { files } = event.dataTransfer

      if (files) {
        setCloning(true)
        // must clone the file, otherwise multiple upload doesn't work on mobile
        // https://github.com/GoogleChrome/developer.chrome.com/issues/2563#issuecomment-1464499084

        Promise.all(
          Array.from(files).map(async (file) => {
            const buffer = await file.arrayBuffer()
            return new File([buffer], file.name, {
              lastModified: file.lastModified,
              type: file.type,
            })
          })
        ).then((clones) => {
          setCloning(false)
          clones.forEach(handleFileUpload)
        })
      }
    },
    [handleFileUpload]
  )

  // ProTip: this callback cannot be async because it doesn't work on mobile
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target

      if (files) {
        setCloning(true)
        // must clone the file, otherwise multiple upload doesn't work on mobile
        // https://github.com/GoogleChrome/developer.chrome.com/issues/2563#issuecomment-1464499084

        Promise.all(
          Array.from(files).map(async (file) => {
            const buffer = await file.arrayBuffer()
            return new File([buffer], file.name, {
              lastModified: file.lastModified,
              type: file.type,
            })
          })
        ).then((clones) => {
          setCloning(false)
          clones.forEach(handleFileUpload)
        })
      }
    },
    [handleFileUpload]
  )

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
        {cloning ? (
          <Stack alignItems="center" gap={4}>
            <span>
              <CircularProgress
                size={12}
                color="inherit"
                sx={{ marginBottom: "-1px", marginRight: 1 }}
              />
              Uploading files...
            </span>
          </Stack>
        ) : (
          <Stack alignItems="center" gap={4}>
            {children}
            <span>
              Drag and drop your <code>.csv</code> files here or <u>browse files</u> from your
              computer.
            </span>
          </Stack>
        )}
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
