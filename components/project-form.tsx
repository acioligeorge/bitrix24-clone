"use client"

import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  createProjectAction,
  updateProjectAction,
  type ProjectFormState,
  getClientsForSelect,
} from "@/app/projetos/actions"
import type { Project, Client } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { X, CalendarIcon, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ProjectFormProps {
  project?: Project | null
  onFormSubmit?: () => void
  onCancel?: () => void
}

const initialState: ProjectFormState = { message: null, type: null, errors: {} }

const projectStatusOptions: { value: Project["status"]; label: string }[] = [
  { value: "not-started", label: "Não Iniciado" },
  { value: "in-progress", label: "Em Progresso" },
  { value: "completed", label: "Concluído" },
  { value: "on-hold", label: "Em Espera" },
  { value: "cancelled", label: "Cancelado" },
]

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? (isEditing ? "Salvando..." : "Criando...") : isEditing ? "Salvar Alterações" : "Criar Projeto"}
    </Button>
  )
}

export function ProjectForm({ project, onFormSubmit, onCancel }: ProjectFormProps) {
  const isEditing = !!project
  const action = isEditing ? updateProjectAction.bind(null, project.id) : createProjectAction
  const [state, formAction] = useActionState(action, initialState)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [clients, setClients] = useState<Pick<Client, "id" | "name">[]>([])
  const [dueDate, setDueDate] = useState<Date | undefined>(
    project?.dueDate ? (typeof project.dueDate === "string" ? parseISO(project.dueDate) : project.dueDate) : undefined,
  )

  useEffect(() => {
    async function fetchClients() {
      const fetchedClients = await getClientsForSelect()
      setClients(fetchedClients)
    }
    fetchClients()
  }, [])

  useEffect(() => {
    if (state?.type === "success") {
      toast({ title: "Sucesso!", description: state.message })
      if (onFormSubmit) onFormSubmit()
      if (!isEditing) {
        formRef.current?.reset()
        setDueDate(undefined)
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
            <CardTitle>{isEditing ? "Editar Projeto" : "Novo Projeto"}</CardTitle>
            {onCancel && (
              <Button variant="ghost" size="icon" type="button" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            {isEditing ? "Atualize os dados do projeto." : "Preencha os dados para criar um novo projeto."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome do Projeto</Label>
            <Input id="name" name="name" defaultValue={project?.name} required />
            {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea id="description" name="description" defaultValue={project?.description} rows={3} />
            {state?.errors?.description && <p className="text-sm text-red-500">{state.errors.description[0]}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="clientId">Cliente (opcional)</Label>
              <Select name="clientId" defaultValue={project?.clientId || ""}>
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum cliente</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.clientId && <p className="text-sm text-red-500">{state.errors.clientId[0]}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={project?.status} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.status && <p className="text-sm text-red-500">{state.errors.status[0]}</p>}
            </div>
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
