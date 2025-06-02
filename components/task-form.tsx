"use client"

import { useFormStatus } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  createTaskAction,
  updateTaskAction,
  type TaskFormState,
  getProjectsForSelect,
  getEmployeesForSelect,
} from "@/app/tarefas/actions"
import type { Task, Project, Employee } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { X, CalendarIcon, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface TaskFormProps {
  task?: Task | null
  defaultProjectId?: string // Para pré-selecionar projeto ao criar a partir da página de um projeto
  onFormSubmit?: () => void
  onCancel?: () => void
}

const initialState: TaskFormState = { message: null, type: null, errors: {} }

const taskStatusOptions: { value: Task["status"]; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "A Fazer" },
  { value: "in-progress", label: "Em Progresso" },
  { value: "review", label: "Em Revisão" },
  { value: "done", label: "Concluída" },
]

const taskPriorityOptions: { value: Task["priority"]; label: string }[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
]

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? (isEditing ? "Salvando..." : "Criando...") : isEditing ? "Salvar Alterações" : "Criar Tarefa"}
    </Button>
  )
}

export function TaskForm({ task, defaultProjectId, onFormSubmit, onCancel }: TaskFormProps) {
  const isEditing = !!task
  const action = isEditing ? updateTaskAction.bind(null, task.id) : createTaskAction
  const [state, formAction] = useActionState(action, initialState)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  const [projects, setProjects] = useState<Pick<Project, "id" | "name">[]>([])
  const [employees, setEmployees] = useState<Pick<Employee, "id" | "name">[]>([])
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? (typeof task.dueDate === "string" ? parseISO(task.dueDate) : task.dueDate) : undefined,
  )

  useEffect(() => {
    async function fetchDataForSelects() {
      const [fetchedProjects, fetchedEmployees] = await Promise.all([getProjectsForSelect(), getEmployeesForSelect()])
      setProjects(fetchedProjects)
      setEmployees(fetchedEmployees)
    }
    fetchDataForSelects()
  }, [])

  useEffect(() => {
    if (state?.type === "success") {
      toast({ title: "Sucesso!", description: state.message })
      if (onFormSubmit) onFormSubmit()
      if (!isEditing) {
        formRef.current?.reset()
        setDueDate(undefined)
        // Se defaultProjectId for fornecido, o campo do projeto não será resetado pelo formRef.current.reset()
        // então precisamos garantir que ele permaneça ou seja resetado conforme a lógica desejada.
        // Neste caso, se for criação, o defaultProjectId deve ser mantido se existir.
      }
    } else if (state?.type === "error") {
      toast({ title: "Erro!", description: state.message || "Ocorreu um erro.", variant: "destructive" })
    }
  }, [state, toast, onFormSubmit, isEditing])

  return (
    <Card className="w-full max-w-lg mx-auto">
      <form action={formAction} ref={formRef}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{isEditing ? "Editar Tarefa" : "Nova Tarefa"}</CardTitle>
            {onCancel && (
              <Button variant="ghost" size="icon" type="button" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            {isEditing ? "Atualize os dados da tarefa." : "Preencha os dados para criar uma nova tarefa."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Título da Tarefa</Label>
            <Input id="title" name="title" defaultValue={task?.title} required />
            {state?.errors?.title && <p className="text-sm text-red-500">{state.errors.title[0]}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="projectId">Projeto</Label>
            <Select name="projectId" defaultValue={task?.projectId || defaultProjectId} required>
              <SelectTrigger id="projectId">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.projectId && <p className="text-sm text-red-500">{state.errors.projectId[0]}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea id="description" name="description" defaultValue={task?.description} rows={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="assigneeId">Responsável (opcional)</Label>
              <Select name="assigneeId" defaultValue={task?.assigneeId || ""}>
                <SelectTrigger id="assigneeId">
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguém atribuído</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={task?.status} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {taskStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.status && <p className="text-sm text-red-500">{state.errors.status[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="priority">Prioridade</Label>
              <Select name="priority" defaultValue={task?.priority} required>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {taskPriorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.priority && <p className="text-sm text-red-500">{state.errors.priority[0]}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="dueDate">Data de Entrega (opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
              <Input type="hidden" name="dueDate" value={dueDate ? format(dueDate, "yyyy-MM-dd") : ""} />
              {state?.errors?.dueDate && <p className="text-sm text-red-500">{state.errors.dueDate[0]}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
          {onCancel && !isEditing && (
            <Button variant="outline" type="button" onClick={onCancel} className="w-full sm:w-auto">
              Cancelar
            </Button>
          )}
          <SubmitButton isEditing={isEditing} />
        </CardFooter>
      </form>
    </Card>
  )
}
