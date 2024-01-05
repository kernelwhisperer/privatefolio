import { Connection } from "src/interfaces"
import { $activeAccount } from "src/stores/account-store"

import { $filterOptionsMap, computeMetadata } from "../stores/metadata-store"
import { $taskQueue, enqueueTask, TaskPriority } from "../stores/task-store"
import { clancy } from "../workers/remotes"

export function handleAuditLogChange() {
  enqueueIndexDatabase()
  enqueueRecomputeBalances()
  enqueueFetchPrices()
  enqueueComputeNetworth()
}

export function refreshNetworth() {
  enqueueRefreshBalances()
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
      await clancy.computeBalances(progress, signal, { since: 0 }, $activeAccount.get())
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
      await clancy.computeBalances(progress, signal, undefined, $activeAccount.get())
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

export function enqueueComputeNetworth() {
  const taskQueue = $taskQueue.get()

  const existing = taskQueue.find((task) => task.name === "Compute networth")

  if (existing) return

  enqueueTask({
    description: "Computing historical networth.",
    determinate: true,
    function: async (progress) => {
      await clancy.computeNetworth(progress, $activeAccount.get())
    },
    name: "Compute networth",
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
