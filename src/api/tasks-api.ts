export enum TaskPriority {
  Low = 2,
  Medium = 5,
  High = 8,
}

export interface Task {
  completedAt?: number
  duration?: number // Duration in milliseconds
  function: () => Promise<void>
  name: string
  priority: TaskPriority
}

const history: Task[] = []
const queue: Task[] = [
  {
    function: () => new Promise((resolve) => setTimeout(resolve, 1000)),
    name: "Import data",
    priority: TaskPriority.Low,
  },
]
let isProcessing = false // Flag to check if processQueue is already running

export function isEmpty(): boolean {
  return queue.length === 0
}

export function size(): number {
  return queue.length
}

export function peek(): Task | undefined {
  return queue[0]
}

export function listTasks(): Task[] {
  return queue
}

export function dequeue(): Task | undefined {
  return queue.shift()
}

async function processQueue() {
  isProcessing = true
  while (!isEmpty()) {
    const task = dequeue()
    if (task) {
      const startTime = Date.now()
      try {
        await task.function()
        const endTime = Date.now()
        task.completedAt = endTime
        task.duration = endTime - startTime // Calculate duration
        history.push(task) // Add the completed task to history
      } catch (error) {
        console.error("Error processing task:", error)
        // Handle failed task, maybe add it to a separate history
      }
    }
  }
  isProcessing = false
}

export function enqueue(item: Task & { priority?: TaskPriority }) {
  queue.push(item)
  queue.sort((a, b) => a.priority - b.priority) // Sort on enqueue
  if (!isProcessing) {
    processQueue()
  }
}

export function getHistory() {
  return history
}
