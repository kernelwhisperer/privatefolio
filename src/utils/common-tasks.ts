import { Connection } from "src/interfaces"
import { $priceApi } from "src/stores/account-settings-store"
import { $activeAccount } from "src/stores/account-store"

import { $filterOptionsMap, computeMetadata } from "../stores/metadata-store"
import { $taskQueue, enqueueTask, TaskPriority } from "../stores/task-store"
import { clancy } from "../workers/remotes"

export function handleAuditLogChange() {
  enqueueIndexDatabase()
  // invalidate balancesCursor
  enqueueRefreshBalances()
  enqueueFetchPrices()
  enqueueRefreshNetworth()
}

export function refreshNetworth() {
  enqueueRefreshBalances()
  enqueueFetchPrices()
  enqueueRefreshNetworth()
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
      await clancy.indexAuditLogs(progress, $activeAccount.get())
      await clancy.indexTransactions(progress, $activeAccount.get())
      await clancy.computeGenesis($activeAccount.get())
      await clancy.computeLastTx($activeAccount.get())
    },
    name: "Index database",
    priority: TaskPriority.Medium,
  })
}

export function enqueueRecomputeBalances() {
  const taskQueue = $taskQueue.get()

  const existing = taskQueue.find((task) => task.name === "Recompute balances")

  if (existing) return

  enqueueTask({
    abortable: true,
    description: "Recomputing balances of owned assets.",
    determinate: true,
    function: async (progress, signal) => {
      await clancy.computeBalances($activeAccount.get(), { since: 0 }, progress, signal)
    },
    name: "Recompute balances",
    priority: TaskPriority.Medium,
  })
}

export function enqueueRefreshBalances() {
  const taskQueue = $taskQueue.get()

  const existing = taskQueue.find((task) => task.name === "Refresh balances")

  if (existing) return

  enqueueTask({
    abortable: true,
    description: "Refreshing balances of owned assets.",
    determinate: true,
    function: async (progress, signal) => {
      await clancy.computeBalances($activeAccount.get(), undefined, progress, signal)
    },
    name: "Refresh balances",
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
      await computeMetadata()
      await clancy.fetchDailyPrices(
        {
          priceApiId: $priceApi.get(),
          symbols: $filterOptionsMap.get().symbol,
        },
        progress,
        signal
      )
    },
    name: "Fetch asset prices",
    priority: TaskPriority.Low,
  })
}

export function enqueueRecomputeNetworth() {
  const taskQueue = $taskQueue.get()

  const existing = taskQueue.find((task) => task.name === "Recompute networth")

  if (existing) return

  enqueueTask({
    abortable: true,
    description: "Recomputing historical networth.",
    determinate: true,
    function: async (progress, signal) => {
      await clancy.computeNetworth($activeAccount.get(), 0, progress, signal)
    },
    name: "Recompute networth",
    priority: TaskPriority.Low,
  })
}

export function enqueueRefreshNetworth() {
  const taskQueue = $taskQueue.get()

  const existing = taskQueue.find((task) => task.name === "Refresh networth")

  if (existing) return

  enqueueTask({
    abortable: true,
    description: "Refresh historical networth.",
    determinate: true,
    function: async (progress, signal) => {
      await clancy.computeNetworth($activeAccount.get(), undefined, progress, signal)
    },
    name: "Refresh networth",
    priority: TaskPriority.Low,
  })
}

export function enqueueSyncConnection(connection: Connection) {
  enqueueTask({
    description: `Sync "${connection.address}"`,
    determinate: true,
    function: async (progress) => {
      await clancy.syncConnection(progress, connection, $activeAccount.get())
    },
    name: "Sync connection",
    priority: TaskPriority.High,
  })
}
