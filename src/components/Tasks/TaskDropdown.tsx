import { Button, CircularProgress, List, ListItem, ListItemText, Popover } from "@mui/material"
import React, { useEffect, useState } from "react"

import { enqueue, listTasks } from "../../api/tasks-api"

export function TaskDropdown() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const tasks = listTasks()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? "simple-popover" : undefined

  // Logic to determine the button text
  const buttonText =
    tasks.length > 0
      ? `${0}/8 - ${tasks[0].name}` // Assuming function.name is the description
      : "No Tasks"

  useEffect(() => {
    enqueue({
      function: () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, 2000)
        }),
      name: "Task 1",
      priority: 2,
    })
  }, [])

  return (
    <div>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleClick}
        startIcon={<CircularProgress size={16} />}
      >
        {buttonText}
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          horizontal: "left",
          vertical: "bottom",
        }}
        transformOrigin={{
          horizontal: "left",
          vertical: "top",
        }}
      >
        <List dense>
          {tasks.map((task, index) => (
            <ListItem key={index}>
              <ListItemText primary={`Priority: ${task.priority}`} />
            </ListItem>
          ))}
        </List>
      </Popover>
    </div>
  )
}
