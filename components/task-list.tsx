"use client"

import type { Task, Project, Employee } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react" // Adicionado Eye
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { deleteTaskAction } from "@/app/tarefas/actions"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link" // Importar Link

interface TaskListProps {
  tasks: Task[]
  projects: Pick<Project, "id" | "name">[]
  employees: Pick<Employee, "id" | "name">[]
  onEditTask: (task: Task) => void
}

const taskStatusLabels: Record<Task["status"], string> = {
  backlog: "Backlog",
  todo: "A Fazer",
  "in-progress": "Em Progresso",
  review: "Em Revisão",
  done: "Concluída",
}

const taskStatusColors: Record<Task["status"], string> = {
  backlog: "bg-gray-400",
  todo: "bg-yellow-500 text-black",
  "in-progress": "bg-blue-500",
  review: "bg-purple-500",
  done: "bg-green-500",
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

export function TaskList({ tasks, projects, employees, onEditTask }: TaskListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const { toast } = useToast()

  const getProjectName = (projectId: string) => projects.find((p) => p.id === projectId)?.name || "Desconhecido"
  const getEmployeeName = (employeeId?: string | null) => employees.find((e) => e.id === employeeId)?.name || "-"

  const handleDeleteRequest = (task: Task) => {
    setTaskToDelete(task)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (taskToDelete) {
      const result = await deleteTaskAction(taskToDelete.id)
      toast({
        title: result.type === "success" ? "Sucesso!" : "Erro!",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      })
      setTaskToDelete(null)
      setIsDeleteDialogOpen(false)
      // Idealmente, chamar uma função de callback para re-fetch das tarefas na página pai
    }
  }

  if (!tasks || tasks.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhuma tarefa encontrada.</p>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead className="hidden xl:table-cell">Projeto</TableHead>
            <TableHead className="hidden md:table-cell">Responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Prioridade</TableHead>
            <TableHead className="hidden lg:table-cell">Entrega</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">
                <Link href={`/tarefas/${task.id}`} className="hover:underline text-primary">
                  {task.title}
                </Link>
              </TableCell>
              <TableCell className="hidden xl:table-cell">{getProjectName(task.projectId)}</TableCell>
              <TableCell className="hidden md:table-cell">{getEmployeeName(task.assigneeId)}</TableCell>
              <TableCell>
                <Badge className={`${taskStatusColors[task.status]} text-white hover:${taskStatusColors[task.status]}`}>
                  {taskStatusLabels[task.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="outline" className={`${taskPriorityColors[task.priority]}`}>
                  {taskPriorityLabels[task.priority]}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR }) : "-"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <Link href={`/tarefas/${task.id}`} passHref>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => onEditTask(task)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Tarefa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteRequest(task)}
                      className="text-red-600 hover:!text-red-600 hover:!bg-red-50 dark:hover:!bg-red-900/50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Tarefa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a tarefa "{taskToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
