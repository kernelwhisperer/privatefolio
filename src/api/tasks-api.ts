import { atom } from "nanostores"

export enum TaskPriority {
  Low = 2,
  Medium = 5,
  High = 8,
}

export interface Task {
  function: () => Promise<void>
  name: string
  priority: TaskPriority
}

export interface FinishedTask {
  completedAt?: number
  duration: number // Duration in milliseconds
  name: string
}

export const $taskHistory = atom<FinishedTask[]>([])
export const $taskQueue = atom<Task[]>([])
export const $pendingTask = atom<Task | undefined>()

let isProcessing = false // Flag to check if processQueue is already running

function dequeue(): Task | undefined {
  const newQueue = [...$taskQueue.get()]
  const task = newQueue.shift()
  $taskQueue.set(newQueue)
  return task
}

async function processQueue() {
  isProcessing = true
  while ($taskQueue.get().length !== 0) {
    const task = dequeue()
    $pendingTask.set(task)

    if (task) {
      const startTime = Date.now()
      try {
        console.log(`Processing task: ${task.name}`)
        await task.function()
        console.log(`Completed task: ${task.name}`)
        const endTime = Date.now()
        $pendingTask.set(undefined)
        $taskHistory.set([
          {
            completedAt: endTime,
            duration: endTime - startTime, // Calculate duration
            name: task.name,
          },
          ...$taskHistory.get(),
        ]) // Add the completed task to history
      } catch (error) {
        console.error("Error processing task:", error)
        // Handle failed task, maybe add it to a separate history
      }
    }
  }
  isProcessing = false
}

export function enqueue(item: Task & { priority?: TaskPriority }) {
  const newQueue = [...$taskQueue.get(), item]
  newQueue.sort((a, b) => a.priority - b.priority) // Sort on enqueue
  $taskQueue.set(newQueue)

  if (!isProcessing) {
    processQueue()
  }
}
