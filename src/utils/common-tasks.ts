import { $filterOptionsMap } from "../stores/metadata-store"
import { $taskQueue, enqueueTask, TaskPriority } from "../stores/task-store"
import { clancy } from "../workers/remotes"

export function handleAuditLogChange() {
  enqueueIndexDatabase()
  enqueueComputeBalances()
  enqueueFetchPrices()
  enqueueComputeNetworth()
}

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
      await clancy.computeGenesis()
      await clancy.computeLastTx()
    },
    name: "Index database",
    priority: TaskPriority.Medium,
  })
}

export function enqueueComputeBalances() {
  const taskQueue = $taskQueue.get()

  const existing = taskQueue.find((task) => task.name === "Compute balances")

  if (existing) return

  enqueueTask({
    abortable: true,
    description: "Computing balances of owned assets.",
    determinate: true,
    function: async (progress, signal) => {
      await clancy.computeBalances(progress, signal)
    },
    name: "Compute balances",
    priority: TaskPriority.Medium,
  })
}

export function enqueueFetchPrices() {
  const taskQueue = $taskQueue.get()

  const existing = taskQueue.find((task) => task.name === "Fetch asset prices")

  if (existing) return

  enqueueTask({
    abortable: true,
    description: "Fetching price data for all assets.",
    determinate: true,
    function: async (progress, signal) => {
      await clancy.fetchDailyPrices($filterOptionsMap.get().symbol, progress, signal)
    },
    name: "Fetch asset prices",
    priority: TaskPriority.Low,
  })
}

export function enqueueComputeNetworth() {
  const taskQueue = $taskQueue.get()

  const existing = taskQueue.find((task) => task.name === "Compute networth")

  if (existing) return

  enqueueTask({
    description: "Computing historical networth.",
    determinate: true,
    function: async (progress) => {
      await clancy.computeNetworth(progress)
    },
    name: "Compute networth",
    priority: TaskPriority.Low,
  })
}
