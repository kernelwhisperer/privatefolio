import {
  CheckRounded,
  DoneAllRounded,
  HourglassEmptyRounded,
  StorageRounded,
} from "@mui/icons-material"
import {
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Menu,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import { grey } from "@mui/material/colors"
import { useStore } from "@nanostores/react"
import React, { useEffect, useState } from "react"

import { $pendingTask, $taskHistory, $taskQueue } from "../../stores/task-store"
import { MonoFont } from "../../theme"
import { formatFileSize, formatNumber } from "../../utils/client-utils"
import { SectionTitle } from "../SectionTitle"
import { Truncate } from "../Truncate"

export function TaskDropdown() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const pendingTask = useStore($pendingTask)
  const taskQueue = useStore($taskQueue)
  const taskHistory = useStore($taskHistory)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  useEffect(() => {
    // enqueueTask({
    //   function: () =>
    //     new Promise((resolve) => {
    //       setTimeout(() => {
    //         resolve(1)
    //       }, 2000)
    //     }),
    //   name: "Fetch prices",
    //   priority: 2,
    // })
    // enqueueTask({
    //   function: () =>
    //     new Promise((resolve) => {
    //       setTimeout(() => {
    //         resolve(1)
    //       }, 31000)
    //     }),
    //   name: "Import data",
    //   priority: 2,
    // })
    // enqueueTask({
    //   function: () =>
    //     new Promise((resolve) => {
    //       setTimeout(() => {
    //         resolve(1)
    //       }, 100)
    //     }),
    //   name: "Compact data",
    //   priority: 2,
    // })
  }, [])

  const [storageUsage, setStorageUsage] = useState<number | null>(null)

  useEffect(() => {
    window.navigator.storage.estimate().then((estimate: any) => {
      setStorageUsage(estimate.usageDetails?.indexedDB ?? null)
    })
  }, [anchorEl])

  return (
    <div>
      <Button
        size="small"
        variant="outlined"
        color={pendingTask ? "info" : "secondary"}
        onClick={handleClick}
        startIcon={
          pendingTask ? <CircularProgress size={14} color="inherit" /> : <DoneAllRounded />
        }
      >
        <Truncate sx={{ maxWidth: 260 }}>
          {pendingTask ? `${pendingTask.name}` : "Up to date"}
        </Truncate>
      </Button>
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
        transformOrigin={{
          horizontal: "right",
          vertical: "top",
        }}
        sx={{ marginTop: 0.5 }}
        MenuListProps={{ sx: { maxHeight: 256 } }}
      >
        <Stack sx={{ paddingTop: 1, paddingX: 1.5 }} gap={2}>
          <div>
            <SectionTitle>Database info</SectionTitle>
            <Stack direction="row" gap={1} marginLeft={1}>
              <Tooltip title="Disk usage">
                <StorageRounded fontSize="small" />
              </Tooltip>
              {storageUsage === null ? (
                <Skeleton></Skeleton>
              ) : (
                <Tooltip
                  title={
                    <Stack>
                      <span>{formatFileSize(storageUsage, true)}</span>
                      <Typography color={grey[400]} component="i" variant="inherit">
                        <span>{formatNumber(storageUsage)} Bytes</span>
                      </Typography>
                    </Stack>
                  }
                >
                  <Typography fontFamily={MonoFont} variant="body2">
                    <span>{formatFileSize(storageUsage)}</span>
                  </Typography>
                </Tooltip>
              )}
            </Stack>
          </div>
          <SectionTitle>Task list</SectionTitle>
        </Stack>
        <List
          dense
          sx={{
            maxWidth: 340,
            minWidth: 340,
          }}
        >
          {taskQueue.map((task, index) => (
            <ListItem key={index}>
              <HourglassEmptyRounded sx={{ marginRight: 1, width: 16 }} color="info" />
              <ListItemText primary={<Truncate>{task.name}</Truncate>} />
            </ListItem>
          ))}
          {pendingTask && (
            <ListItem>
              <CircularProgress size={14} sx={{ marginRight: 1 }} color="info" />
              <ListItemText primary={<Truncate>{pendingTask.name}</Truncate>} />
            </ListItem>
          )}
          {taskHistory.map((task, index) => (
            <ListItem key={index}>
              <CheckRounded sx={{ marginRight: 1, width: 16 }} color="success" />
              <ListItemText
                primary={
                  <Stack direction="row" gap={0.5}>
                    <Truncate>{task.name}</Truncate>
                    <Typography
                      fontFamily={MonoFont}
                      variant="inherit"
                      component="span"
                      color="text.secondary"
                    >
                      (
                      {formatNumber(task.duration / 1000, {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                      })}
                      s)
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
          ))}
          {taskQueue.length === 0 && taskHistory.length === 0 && !pendingTask && (
            <ListItem>
              <ListItemText primary="Nothing to see here" />
            </ListItem>
          )}
        </List>
      </Menu>
    </div>
  )
}
