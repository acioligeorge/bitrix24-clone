"use client"

import type { Task, Employee } from "@/lib/types"
import { KanbanColumn } from "./kanban-column"

interface KanbanBoardProps {
  tasks: Task[]
  employees: Pick<Employee, "id" | "name">[]
  onEditTask: (task: Task) => void
}

const taskStatusOrder: Task["status"][] = ["backlog", "todo", "in-progress", "review", "done"]
const taskStatusLabels: Record<Task["status"], string> = {
  backlog: "Backlog",
  todo: "A Fazer",
  "in-progress": "Em Progresso",
  review: "Em Revisão",
  done: "Concluída",
}

export function KanbanBoard({ tasks, employees, onEditTask }: KanbanBoardProps) {
  const groupedTasks = taskStatusOrder.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status)
      return acc
    },
    {} as Record<Task["status"], Task[]>,
  )

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {taskStatusOrder.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          title={taskStatusLabels[status]}
          tasks={groupedTasks[status]}
          employees={employees}
          onEditTask={onEditTask}
        />
      ))}
    </div>
  )
}
