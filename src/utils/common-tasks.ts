import { $taskQueue, enqueueTask, TaskPriority } from "../stores/task-store"
import { clancy } from "../workers/remotes"

export function enqueueIndexDatabase() {
  const taskQueue = $taskQueue.get()

  const existing = taskQueue.find((task) => task.name === "Index database")

  if (existing) return

  enqueueTask({
    description:
      "Index audit logs and transactions to allow sorting, filtering and quicker query times.",
    determinate: true,
    function: async (progress) => {
      await clancy.indexAuditLogs(progress)
      await clancy.indexTransactions(progress)
    },
    name: "Index database",
    priority: TaskPriority.Low,
  })
}
