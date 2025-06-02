import { Suspense } from "react"
import { notFound } from "next/navigation"
import {
  getProjectById,
  getTasks,
  getClients,
  getEmployees,
  getClientById, // Para buscar o nome do cliente específico
} from "@/app/data"
import type { Project } from "@/lib/types"

// Componentes Client-Side para interatividade com modais
import ProjectDetailsClientPart from "./project-details-client"

// Mapeamentos de status e prioridade (poderiam vir de um arquivo de constantes)
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

interface ProjectDetailsPageProps {
  params: { id: string }
}

async function ProjectDetailsPageContent({ params }: ProjectDetailsPageProps) {
  const projectId = params.id
  const project = await getProjectById(projectId)

  if (!project) {
    notFound()
  }

  // Fetching data in parallel
  const [projectTasks, allClients, allEmployees, projectClient] = await Promise.all([
    getTasks({ projectId: project.id }),
    getClients().then((cls) => cls.map((c) => ({ id: c.id, name: c.name }))),
    getEmployees().then((emps) => emps.filter((e) => e.isActive).map((e) => ({ id: e.id, name: e.name }))),
    project.clientId ? getClientById(project.clientId) : Promise.resolve(null),
  ])

  return (
    <ProjectDetailsClientPart
      project={project}
      projectTasks={projectTasks}
      allClients={allClients}
      allEmployees={allEmployees}
      projectClientName={projectClient?.name}
    />
  )
}

// Componente principal da página que usa Suspense
export default function Page({ params }: ProjectDetailsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-40 md:col-span-1" />
            <Skeleton className="h-60 md:col-span-2" />
          </div>
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-48 w-full" />
        </div>
      }
    >
      <ProjectDetailsPageContent params={params} />
    </Suspense>
  )
}

// Skeleton para o conteúdo da página
function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-md ${className}`} />
}
