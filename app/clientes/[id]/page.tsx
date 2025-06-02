import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getClientById, getProjects, getEmployees } from "@/app/data"
import ClientDetailsClientPart from "./client-details-client"
import LoadingClientDetails from "./loading" // Importar o skeleton

interface ClientDetailsPageProps {
  params: { id: string }
}

async function ClientDetailsPageContent({ params }: ClientDetailsPageProps) {
  const clientId = params.id
  const client = await getClientById(clientId)

  if (!client) {
    notFound()
  }

  // Buscar projetos e filtrar aqueles associados a este cliente
  const allProjects = await getProjects()
  const clientProjects = allProjects.filter((project) => project.clientId === clientId)

  // Buscar todos os empregados (para selects em formulários de projeto/tarefa, se necessário)
  const allEmployees = (await getEmployees()).filter((emp) => emp.isActive).map((e) => ({ id: e.id, name: e.name }))

  return <ClientDetailsClientPart client={client} initialClientProjects={clientProjects} allEmployees={allEmployees} />
}

export default function Page({ params }: ClientDetailsPageProps) {
  return (
    <Suspense fallback={<LoadingClientDetails />}>
      <ClientDetailsPageContent params={params} />
    </Suspense>
  )
}
