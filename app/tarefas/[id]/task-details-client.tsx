"use client"

import { useState } from "react"
import type { Task, Project, Employee } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TaskForm } from "@/components/task-form"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Edit, ArrowLeft, CheckSquare, Briefcase, User, CalendarDays, AlertTriangle, Info } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
// Supondo que getTaskById, getProjectById, getEmployeeById possam ser chamadas se necessário para refresh
// ou que as actions de formulário revalidem os paths corretamente.
import { getTaskById } from "@/app/data" // Para simular refresh

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

interface TaskDetailsClientPartProps {
  task: Task
  projectName?: string | null
  assigneeName?: string | null
  // Passar todos os projetos e empregados para o TaskForm
  allProjects: Pick<Project, "id" | "name">[]
  allEmployees: Pick<Employee, "id" | "name">[]
}

export default function TaskDetailsClientPart({
  task: initialTask,
  projectName: initialProjectName,
  assigneeName: initialAssigneeName,
  allProjects,
  allEmployees,
}: TaskDetailsClientPartProps) {
  const [task, setTask] = useState(initialTask)
  const [projectName, setProjectName] = useState(initialProjectName)
  const [assigneeName, setAssigneeName] = useState(initialAssigneeName)

  const [showEditTaskModal, setShowEditTaskModal] = useState(false)
  const { toast } = useToast()

  const refreshTaskData = async () => {
    // Em um app real, você faria um fetch dos dados atualizados.
    // Por enquanto, vamos simular com os dados que temos.
    // A revalidação de path nas Server Actions deve cuidar da atualização na próxima navegação.
    try {
      const updatedTask = await getTaskById(task.id) // Simula refetch
      if (updatedTask) {
        setTask(updatedTask)
        // Idealmente, buscaria nomes de projeto/responsável atualizados também se pudessem mudar
      }
    } catch (error) {
      console.error("Erro ao tentar atualizar dados da tarefa:", error)
    }
  }

  const handleTaskFormSuccess = () => {
    setShowEditTaskModal(false)
    toast({ title: "Sucesso!", description: "Tarefa atualizada." })
    refreshTaskData() // Tenta atualizar os dados na UI
  }

  const handleEditTask = () => {
    setShowEditTaskModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/tarefas">
            <Button variant="outline" size="icon" aria-label="Voltar para tarefas">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-primary" />
            {task.title}
          </h1>
        </div>
        <Button variant="outline" onClick={handleEditTask}>
          <Edit className="mr-2 h-4 w-4" /> Editar Tarefa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Tarefa</CardTitle>
          <CardDescription>Informações completas sobre esta tarefa.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-x-8 gap-y-6 text-sm">
          <div className="md:col-span-2 space-y-4">
            <div>
              <p className="text-muted-foreground font-medium mb-1">Descrição</p>
              <div className="p-3 bg-muted/50 rounded-md min-h-[60px]">
                {task.description ? (
                  <p className="whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="italic text-muted-foreground">Nenhuma descrição fornecida.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Projeto:</span>
              {projectName ? (
                <Link href={`/projetos/${task.projectId}`} className="text-primary hover:underline">
                  {projectName}
                </Link>
              ) : (
                "Não associado"
              )}
            </div>
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Responsável:</span>
              {assigneeName || "Ninguém atribuído"}
            </div>
            <div className="flex items-center">
              <Info className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Status:</span>
              <Badge className={`${taskStatusColors[task.status]} text-white hover:${taskStatusColors[task.status]}`}>
                {taskStatusLabels[task.status]}
              </Badge>
            </div>
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Prioridade:</span>
              <Badge variant="outline" className={`${taskPriorityColors[task.priority]}`}>
                {taskPriorityLabels[task.priority]}
              </Badge>
            </div>
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Data de Entrega:</span>
              {task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy", { locale: ptBR }) : "Não definida"}
            </div>
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Criada em:</span>
              {format(new Date(task.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Atualizada em:</span>
              {format(new Date(task.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal para Editar Tarefa */}
      <Dialog open={showEditTaskModal} onOpenChange={setShowEditTaskModal}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl [&>.absolute.right-4.top-4]:hidden">
          <TaskForm
            task={task}
            // Passar allProjects e allEmployees para o TaskForm popular os selects
            // O TaskForm já tem sua própria lógica para buscar esses dados, mas podemos passá-los
            // para evitar fetches duplicados se já os temos. No entanto, TaskForm já faz isso.
            onFormSubmit={handleTaskFormSuccess}
            onCancel={() => setShowEditTaskModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
