"use client"

import type React from "react"

import type { Task, Employee } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, UserCircle2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation" // Para navegação programática

interface KanbanCardProps {
  task: Task
  employees: Pick<Employee, "id" | "name">[]
  onEditTask: (task: Task) => void // Manter para edição rápida, se necessário, ou remover se tudo for para a página de detalhes
}

const taskPriorityLabels: Record<Task["priority"], string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
}

const taskPriorityColors: Record<Task["priority"], string> = {
  low: "border-green-500 text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400",
  medium: "border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400",
  high: "border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400",
  urgent: "border-red-500 text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400",
}

export function KanbanCard({ task, employees, onEditTask }: KanbanCardProps) {
  const assignee = employees.find((e) => e.id === task.assigneeId)
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Evitar navegação se o clique foi em um elemento interativo dentro do card (se houver no futuro)
    // if ((e.target as HTMLElement).closest('button, a')) {
    //   return;
    // }
    router.push(`/tarefas/${task.id}`)
  }

  // A função onEditTask pode ser chamada por um botão de edição rápida no card, se desejado.
  // Por ora, o clique no card inteiro leva para a página de detalhes.

  return (
    <Card
      className="mb-3 cursor-pointer hover:shadow-lg transition-shadow duration-150 bg-card group"
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/tarefas/${task.id}`)}
    >
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
          {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 text-xs space-y-2">
        {task.description && <p className="text-muted-foreground line-clamp-2">{task.description}</p>}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${taskPriorityColors[task.priority]}`}>
            {taskPriorityLabels[task.priority]}
          </Badge>
          {assignee ? (
            <div className="flex items-center" title={`Responsável: ${assignee.name}`}>
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={assignee.avatarUrl || `/placeholder.svg?height=20&width=20&query=avatar+${assignee.name}`}
                />
                <AvatarFallback>{assignee.name.substring(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <UserCircle2 className="h-5 w-5 text-muted-foreground" title="Sem responsável" />
          )}
        </div>
        {task.dueDate && (
          <div className="flex items-center text-muted-foreground">
            <CalendarDays className="mr-1 h-3 w-3" />
            <span>{format(new Date(task.dueDate), "dd MMM", { locale: ptBR })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
