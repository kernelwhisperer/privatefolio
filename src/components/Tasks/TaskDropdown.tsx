import {
  CancelOutlined,
  CheckRounded,
  ClearRounded,
  DoneAllRounded,
  HourglassEmptyRounded,
} from "@mui/icons-material"
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  Stack,
  Typography,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { useState } from "react"

import { $pendingTask, $taskHistory, $taskQueue, cancelTask } from "../../stores/task-store"
import { MonoFont } from "../../theme"
import { Truncate } from "../Truncate"
import { PendingTaskProgress } from "./PendingTaskProgress"
import { TaskDetailsDialog } from "./TaskDetailsDialog"
import { TaskDuration } from "./TaskDuration"

export function TaskDropdown() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const pendingTask = useStore($pendingTask)
  const taskQueue = useStore($taskQueue)
  const taskHistory = useStore($taskHistory)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  // useEffect(() => {
  //   enqueueTask({
  //     description: "Fetching price data for all assets",
  //     function: () =>
  //       new Promise((resolve, reject) => {
  //         setTimeout(() => {
  //           reject(new Error("Something went wrong"))
  //         }, 2830)
  //       }),
  //     name: "Fetch prices",
  //     priority: 2,
  //   })
  //   enqueueTask({
  //     description: "Fetching price data for all assets",
  //     determinate: true,
  //     function: (progress) =>
  //       new Promise((resolve) => {
  //         const numbers = Array.from({ length: 10 }, (_, i) => i + 1)
  //         numbers.forEach((number) => {
  //           setTimeout(() => {
  //             progress([
  //               number * 3,
  //               `Fetching price for ${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
  //             ])
  //           }, number * 1000)
  //         })

  //         setTimeout(() => {
  //           resolve(null)
  //         }, 10_000)
  //       }),
  //     name: "Import data",
  //     priority: 2,
  //   })
  //   enqueueTask({
  //     description: "Fetching price data for all assets",
  //     function: () =>
  //       new Promise((resolve) => {
  //         setTimeout(() => {
  //           resolve(null)
  //         }, 100)
  //       }),
  //     name: "Compact data",
  //     priority: 2,
  //   })
  // }, [])

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color={pendingTask ? "info" : "secondary"}
        sx={{ paddingY: 0.5 }}
        onClick={handleClick}
        startIcon={pendingTask ? <PendingTaskProgress /> : <DoneAllRounded />}
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
        MenuListProps={{ sx: { maxHeight: 224 } }}
        slotProps={{ paper: { sx: { overflowY: "scroll" } } }}
      >
        <List
          dense
          sx={{
            "& .MuiListItem-root": {
              paddingY: 0,
            },
            "& .MuiListItemButton-root": {
              borderRadius: 1,
              opacity: "1 !important",
            },
            marginX: -1,
            maxWidth: 340,
            minWidth: 340,
            paddingY: 0.5,
          }}
        >
          {taskQueue
            .slice()
            .reverse()
            .map((task) => (
              <ListItem
                key={task.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    size="small"
                    onClick={() => cancelTask(task.id)}
                  >
                    <CancelOutlined fontSize="inherit" />
                  </IconButton>
                }
              >
                <ListItemButton disabled>
                  <HourglassEmptyRounded sx={{ marginRight: 1, width: 16 }} color="info" />
                  <ListItemText primary={<Truncate>{task.name}</Truncate>} />
                </ListItemButton>
              </ListItem>
            ))}
          {pendingTask && (
            <ListItem
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  size="small"
                  onClick={() => cancelTask(pendingTask.id)}
                >
                  <CancelOutlined fontSize="inherit" />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => setSelectedTaskId(pendingTask.id)}>
                <PendingTaskProgress sx={{ marginRight: 1.25 }} />
                <ListItemText
                  primary={
                    <Stack direction="row" gap={0.5}>
                      <Truncate>{pendingTask.name}</Truncate>
                      <Typography fontFamily={MonoFont} variant="inherit" color="text.secondary">
                        (<TaskDuration task={pendingTask} />)
                      </Typography>
                    </Stack>
                  }
                />
              </ListItemButton>
            </ListItem>
          )}
          {taskHistory.map((task) => (
            <ListItem key={task.id} dense>
              <ListItemButton onClick={() => setSelectedTaskId(task.id)} dense>
                {task.errorMessage ? (
                  <ClearRounded sx={{ marginRight: 1, width: 16 }} color="error" />
                ) : (
                  <CheckRounded sx={{ marginRight: 1, width: 16 }} color="success" />
                )}
                <ListItemText
                  primary={
                    <Stack direction="row" gap={0.5}>
                      <Truncate>{task.name}</Truncate>
                      <Typography fontFamily={MonoFont} variant="inherit" color="text.secondary">
                        (<TaskDuration task={task} />)
                      </Typography>
                    </Stack>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
          {taskQueue.length === 0 && taskHistory.length === 0 && !pendingTask && (
            <ListItem>
              <ListItemText primary="Nothing to see here" />
            </ListItem>
          )}
        </List>
      </Menu>
      {selectedTaskId && (
        <TaskDetailsDialog open onClose={() => setSelectedTaskId(null)} taskId={selectedTaskId} />
      )}
    </>
  )
}
