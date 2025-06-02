"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TaskList } from "@/components/task-list"
import { TaskForm } from "@/components/task-form"
import { getTasks, getProjects, getEmployees, getProjectById } from "@/app/data"
import type { Task, Project, Employee } from "@/lib/types"
import { PlusCircle, CheckSquare, Filter, Loader2 } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

function TasksPageContent() {
  const searchParams = useSearchParams()
  const projectIdFromQuery = searchParams.get("projectId")

  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Pick<Project, "id" | "name">[]>([])
  const [currentProjectName, setCurrentProjectName] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Pick<Employee, "id" | "name">[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Filtros
  const [filterProjectId, setFilterProjectId] = useState<string>(projectIdFromQuery || "all")
  const [filterAssigneeId, setFilterAssigneeId] = useState<string>("all")

  const fetchData = async (currentFilters: { projectId: string; assigneeId: string }) => {
    setIsLoading(true)
    try {
      const tasksFilter: { projectId?: string; assigneeId?: string } = {}
      if (currentFilters.projectId !== "all") tasksFilter.projectId = currentFilters.projectId
      if (currentFilters.assigneeId !== "all") tasksFilter.assigneeId = currentFilters.assigneeId

      const [fetchedTasks, fetchedProjects, fetchedEmployees] = await Promise.all([
        getTasks(tasksFilter),
        getProjects().then((projs) => projs.map((p) => ({ id: p.id, name: p.name }))),
        getEmployees().then((emps) => emps.filter((e) => e.isActive).map((e) => ({ id: e.id, name: e.name }))),
      ])
      setTasks(fetchedTasks)
      setProjects(fetchedProjects)
      setEmployees(fetchedEmployees)

      if (currentFilters.projectId && currentFilters.projectId !== "all") {
        const proj = await getProjectById(currentFilters.projectId)
        setCurrentProjectName(proj?.name || null)
      } else {
        setCurrentProjectName(null)
      }
    } catch (error) {
      console.error("Erro ao buscar dados de tarefas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData({ projectId: filterProjectId, assigneeId: filterAssigneeId })
  }, [filterProjectId, filterAssigneeId])

  // Atualiza o filtro se o query param mudar
  useEffect(() => {
    setFilterProjectId(projectIdFromQuery || "all")
  }, [projectIdFromQuery])

  const handleFormSuccess = () => {
    setShowFormModal(false)
    setEditingTask(null)
    fetchData({ projectId: filterProjectId, assigneeId: filterAssigneeId }) // Re-fetch com filtros atuais
  }

  const handleAddNewTask = () => {
    setEditingTask(null)
    setShowFormModal(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowFormModal(true)
  }

  const handleCloseModal = () => {
    setShowFormModal(false)
    setEditingTask(null)
  }

  const handleApplyFilters = () => {
    fetchData({ projectId: filterProjectId, assigneeId: filterAssigneeId })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Tarefas{" "}
            {currentProjectName && <span className="text-xl text-muted-foreground">({currentProjectName})</span>}
          </h1>
        </div>
        <Button onClick={handleAddNewTask}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Tarefa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre as tarefas por projeto ou responsável.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="grid gap-1.5 w-full md:w-auto">
            <Label htmlFor="project-filter">Projeto</Label>
            <Select value={filterProjectId} onValueChange={setFilterProjectId}>
              <SelectTrigger id="project-filter" className="w-full md:w-[200px]">
                <SelectValue placeholder="Todos os Projetos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Projetos</SelectItem>
                {projects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 w-full md:w-auto">
            <Label htmlFor="assignee-filter">Responsável</Label>
            <Select value={filterAssigneeId} onValueChange={setFilterAssigneeId}>
              <SelectTrigger id="assignee-filter" className="w-full md:w-[200px]">
                <SelectValue placeholder="Todos os Responsáveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Responsáveis</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleApplyFilters} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
            Aplicar Filtros
          </Button>
        </CardContent>
      </Card>

      {isLoading && !showFormModal ? ( // Não mostrar skeleton da lista se o modal estiver aberto
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <TaskList tasks={tasks} projects={projects} employees={employees} onEditTask={handleEditTask} />
      )}

      <Dialog
        open={showFormModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleCloseModal()
          else setShowFormModal(true)
        }}
      >
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl [&>.absolute.right-4.top-4]:hidden">
          <TaskForm
            task={editingTask}
            defaultProjectId={filterProjectId !== "all" ? filterProjectId : undefined}
            onFormSubmit={handleFormSuccess}
            onCancel={handleCloseModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Adicionar Suspense boundary para useSearchParams
export default function TarefasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <TasksPageContent />
    </Suspense>
  )
}
