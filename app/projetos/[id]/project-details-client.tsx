"use client"

import { useState } from "react"
import type { Project, Task, Client, Employee } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TaskList } from "@/components/task-list"
import { ProjectForm } from "@/components/project-form"
import { TaskForm } from "@/components/task-form"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Edit, PlusCircle, CalendarDays, User, Briefcase, CheckSquare, ArrowLeft, List, LayoutGrid } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { KanbanBoard } from "@/components/kanban/kanban-board" // Importar KanbanBoard
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs" // Para alternar visualização

const projectStatusLabels: Record<Project["status"], string> = {
  "not-started": "Não Iniciado",
  "in-progress": "Em Progresso",
  completed: "Concluído",
  "on-hold": "Em Espera",
  cancelled: "Cancelado",
}

const projectStatusColors: Record<Project["status"], string> = {
  "not-started": "bg-gray-500",
  "in-progress": "bg-blue-500",
  completed: "bg-green-500",
  "on-hold": "bg-yellow-500 text-black",
  cancelled: "bg-red-500",
}

interface ProjectDetailsClientPartProps {
  project: Project
  projectTasks: Task[]
  allClients: Pick<Client, "id" | "name">[]
  allEmployees: Pick<Employee, "id" | "name">[]
  projectClientName?: string | null
}

export default function ProjectDetailsClientPart({
  project: initialProject,
  projectTasks: initialProjectTasks,
  allClients,
  allEmployees,
  projectClientName: initialProjectClientName,
}: ProjectDetailsClientPartProps) {
  const [project, setProject] = useState(initialProject) // Este estado pode ser atualizado após edição do projeto
  const [projectTasks, setProjectTasks] = useState(initialProjectTasks) // Este estado pode ser atualizado após CRUD de tarefas
  const [projectClientName, setProjectClientName] = useState(initialProjectClientName)

  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [showTaskFormModal, setShowTaskFormModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")

  // Simulação de refetch. Em um app real, você usaria SWR, React Query, ou Server Actions que retornam dados.
  const refreshTasks = async () => {
    // Para este exemplo, vamos assumir que as actions revalidam o path e
    // que uma navegação ou refresh traria os dados.
    // Para atualizar a UI imediatamente, precisaríamos de uma forma de buscar os dados novamente.
    // Ex: const updatedTasks = await getTasks({ projectId: project.id }); setProjectTasks(updatedTasks);
    // Por simplicidade, vamos apenas fechar os modais. A revalidação de path nas actions é crucial.
    console.log("Simulando refresh de tarefas...")
  }

  const handleProjectFormSuccess = async () => {
    setShowEditProjectModal(false)
    // Idealmente, buscar o projeto atualizado e atualizar o estado 'project' e 'projectClientName'
    // Ex: const updatedProject = await getProjectById(project.id);
    // if (updatedProject) {
    //   setProject(updatedProject);
    //   if (updatedProject.clientId) {
    //      const client = await getClientById(updatedProject.clientId);
    //      setProjectClientName(client?.name);
    //   } else {
    //      setProjectClientName(null);
    //   }
    // }
    // Por ora, confiamos na revalidação de path.
  }

  const handleTaskFormSuccess = async () => {
    setShowTaskFormModal(false)
    setEditingTask(null)
    // Para atualizar a lista de tarefas ou kanban imediatamente:
    // const updatedTasks = await getTasks({ projectId: project.id }); // Supondo que getTasks existe em app/data.ts
    // setProjectTasks(updatedTasks);
    // Por ora, confiamos na revalidação de path.
  }

  const handleEditProject = () => {
    setShowEditProjectModal(true)
  }

  const handleAddNewTask = () => {
    setEditingTask(null)
    setShowTaskFormModal(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskFormModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/projetos">
            <Button variant="outline" size="icon" aria-label="Voltar para projetos">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-primary" />
            {project.name}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditProject}>
            <Edit className="mr-2 h-4 w-4" /> Editar Projeto
          </Button>
          <Button onClick={handleAddNewTask}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Tarefa
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Projeto</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <p className="text-muted-foreground font-medium">Descrição</p>
            <p className="whitespace-pre-wrap">{project.description || "Nenhuma descrição fornecida."}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Cliente:</span>
              {projectClientName || "Nenhum"}
            </div>
            <div className="flex items-center">
              <Badge
                className={`${projectStatusColors[project.status]} text-white hover:${projectStatusColors[project.status]} mr-2`}
              >
                {projectStatusLabels[project.status]}
              </Badge>
              <span className="text-muted-foreground font-medium">Status</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Data de Entrega:</span>
              {project.dueDate ? format(new Date(project.dueDate), "dd/MM/yyyy", { locale: ptBR }) : "Não definida"}
            </div>
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Criado em:</span>
              {format(new Date(project.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Tarefas do Projeto</h2>
          </div>
          <Tabs defaultValue="list" onValueChange={(value) => setViewMode(value as "list" | "kanban")}>
            <TabsList>
              <TabsTrigger value="list" aria-label="Visualizar como lista">
                <List className="mr-2 h-4 w-4" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="kanban" aria-label="Visualizar como Kanban">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Kanban
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {viewMode === "list" ? (
          <TaskList
            tasks={projectTasks}
            projects={[{ id: project.id, name: project.name }]} // Passando apenas o projeto atual
            employees={allEmployees}
            onEditTask={handleEditTask}
          />
        ) : (
          <KanbanBoard tasks={projectTasks} employees={allEmployees} onEditTask={handleEditTask} />
        )}
      </div>

      {/* Modal para Editar Projeto */}
      <Dialog open={showEditProjectModal} onOpenChange={setShowEditProjectModal}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl [&>.absolute.right-4.top-4]:hidden">
          <ProjectForm
            project={project}
            onFormSubmit={handleProjectFormSuccess}
            onCancel={() => setShowEditProjectModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para Adicionar/Editar Tarefa */}
      <Dialog open={showTaskFormModal} onOpenChange={setShowTaskFormModal}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl [&>.absolute.right-4.top-4]:hidden">
          <TaskForm
            task={editingTask}
            defaultProjectId={project.id} // Sempre associar ao projeto atual
            onFormSubmit={handleTaskFormSuccess}
            onCancel={() => {
              setShowTaskFormModal(false)
              setEditingTask(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
