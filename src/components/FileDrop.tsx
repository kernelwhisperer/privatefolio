import { Button, Paper, Typography, useTheme } from "@mui/material"
import React, { useRef, useState } from "react"

import { addFileImport } from "../api/file-import-api"
// import PouchDB from "pouchdb"; // Uncomment to use PouchDB

export function FileDrop() {
  const [dragOver, setDragOver] = useState(false)
  // const db = new PouchDB("my_database"); // Replace 'my_database' with your database name
  const fileInputRef = useRef<HTMLInputElement>(null)
  const theme = useTheme()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFileImport(e.dataTransfer.files[0])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      addFileImport(files[0])
    }
  }

  return (
    <Paper
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        backgroundColor: dragOver ? "#f0f0f0" : theme.palette.background.paper,
        border: "2px dashed #ccc",
        color: theme.palette.text.primary,
        cursor: "pointer",
        padding: 20,
        textAlign: "center",
      }}
    >
      <Typography variant="body1">Drag and drop a CSV file here</Typography>
      <Button
        variant="contained"
        onClick={() => fileInputRef.current?.click()}
        style={{ marginTop: 20 }}
      >
        Upload File
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        accept=".csv"
      />
    </Paper>
  )
}
