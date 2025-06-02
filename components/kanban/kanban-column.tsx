"use client"

import type { Task, Employee } from "@/lib/types"
import { KanbanCard } from "./kanban-card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface KanbanColumnProps {
  status: Task["status"]
  title: string
  tasks: Task[]
  employees: Pick<Employee, "id" | "name">[]
  onEditTask: (task: Task) => void
}

export function KanbanColumn({ status, title, tasks, employees, onEditTask }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-72 bg-muted/50 rounded-lg p-1">
      <h3 className="text-sm font-semibold p-3 sticky top-0 bg-muted/50 z-10">
        {title} ({tasks.length})
      </h3>
      <ScrollArea className="h-[calc(100vh-20rem)]">
        {" "}
        {/* Altura ajustável */}
        <div className="p-2 space-y-1">
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} employees={employees} onEditTask={onEditTask} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-4">Nenhuma tarefa aqui.</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
