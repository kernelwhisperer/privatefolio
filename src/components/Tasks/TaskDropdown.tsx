import { CheckRounded, DoneAllRounded, HourglassEmptyRounded } from "@mui/icons-material"
import {
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import React, { useState } from "react"

import { $pendingTask, $taskHistory, $taskQueue } from "../../api/tasks-api"
import { MonoFont } from "../../theme"
import { formatNumber } from "../../utils/client-utils"

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

  // useEffect(() => {
  //   enqueue({
  //     function: () =>
  //       new Promise((resolve) => {
  //         setTimeout(() => {
  //           resolve()
  //         }, 2000)
  //       }),
  //     name: "Fetch prices",
  //     priority: 2,
  //   })
  //   enqueue({
  //     function: () =>
  //       new Promise((resolve) => {
  //         setTimeout(() => {
  //           resolve()
  //         }, 31000)
  //       }),
  //     name: "Import data",
  //     priority: 2,
  //   })
  //   enqueue({
  //     function: () =>
  //       new Promise((resolve) => {
  //         setTimeout(() => {
  //           resolve()
  //         }, 100)
  //       }),
  //     name: "Compact data",
  //     priority: 2,
  //   })
  // }, [])

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
        {pendingTask ? `${pendingTask.name}` : "Up to date"}
      </Button>

      <Popover
        id="task-list-popover"
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
        PaperProps={{ elevation: 1 }}
      >
        <List dense sx={{ minWidth: 240 }}>
          {taskQueue.map((task, index) => (
            <ListItem key={index}>
              <HourglassEmptyRounded sx={{ marginRight: 1, width: 16 }} color="info" />
              <ListItemText primary={task.name} />
            </ListItem>
          ))}
          {pendingTask && (
            <ListItem>
              <CircularProgress size={14} sx={{ marginRight: 1 }} color="info" />
              <ListItemText primary={pendingTask.name} />
            </ListItem>
          )}
          {taskHistory.map((task, index) => (
            <ListItem key={index}>
              <CheckRounded sx={{ marginRight: 1, width: 16 }} color="success" />
              <ListItemText
                primary={
                  <>
                    {task.name}{" "}
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
                  </>
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
      </Popover>
    </div>
  )
}
