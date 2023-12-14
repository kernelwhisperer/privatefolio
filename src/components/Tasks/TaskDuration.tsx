import { Typography } from "@mui/material"
import { a, useSpring } from "@react-spring/web"
import React, { useEffect, useState } from "react"

import { FinishedTask, Task } from "../../stores/task-store"
import { formatNumber } from "../../utils/client-utils"

export function TaskDuration({ task }: { task: Task | FinishedTask }) {
  const completed = "duration" in task
  const initialTime = completed ? task.duration : Date.now() - (task.startedAt as number)
  const [time, setTime] = useState(initialTime)

  useEffect(() => {
    if ("duration" in task) return

    setTime(Date.now() - (task.startedAt as number) + 900)
    const interval = setInterval(() => {
      setTime(Date.now() - (task.startedAt as number) + 900)
    }, 1000)

    return () => clearInterval(interval)
  }, [task])

  useEffect(() => {
    if ("duration" in task) {
      setTime(task.duration)
    }
  }, [task])

  const style = useSpring({
    config: { duration: 1000 },
    from: { time: completed ? initialTime : initialTime },
    time,
  })

  return (
    <Typography variant="inherit" component="span" color="text.secondary">
      <a.span>
        {/* https://github.com/pmndrs/react-spring/issues/1461 */}
        {style.time.to(
          (x) =>
            `${formatNumber(x / 1000, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}s`
        )}
      </a.span>
    </Typography>
  )
}
