"use client"

import { useState, useEffect } from "react"
import type { Client, Project, Employee } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ClientForm } from "@/components/client-form"
import { ProjectForm } from "@/components/project-form"
import { ProjectList } from "@/components/project-list"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Edit,
  PlusCircle,
  Mail,
  Phone,
  Building,
  Briefcase,
  ArrowLeft,
  UserCircle,
  CalendarDays,
  Hash,
  FileText,
  Users,
  UserCheck,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { getProjects, getClients as getAllClientsForSelect, getClientById } from "@/app/data"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface ClientDetailsClientPartProps {
  client: Client
  initialClientProjects: Project[]
  allEmployees: Pick<Employee, "id" | "name">[]
}

export default function ClientDetailsClientPart({
  client: initialClient,
  initialClientProjects,
  allEmployees,
}: ClientDetailsClientPartProps) {
  const [client, setClient] = useState(initialClient)
  const [clientProjects, setClientProjects] = useState(initialClientProjects)
  const [allClientsForSelect, setAllClientsForSelect] = useState<Pick<Client, "id" | "name">[]>([])

  const [showEditClientModal, setShowEditClientModal] = useState(false)
  const [showProjectFormModal, setShowProjectFormModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    async function fetchClientsForSelect() {
      try {
        const clients = await getAllClientsForSelect()
        setAllClientsForSelect(clients.map((c) => ({ id: c.id, name: c.name })))
      } catch (error) {
        console.error("Failed to fetch clients for select:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de clientes para o formulário de projeto.",
          variant: "destructive",
        })
      }
    }
    fetchClientsForSelect()
  }, [toast])

  const refreshClientData = async () => {
    try {
      const updatedClient = await getClientById(client.id)
      if (updatedClient) {
        setClient(updatedClient)
      }
    } catch (error) {
      console.error("Failed to refresh client data:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados do cliente.",
        variant: "destructive",
      })
    }
  }

  const refreshClientProjects = async () => {
    try {
      const projects = await getProjects()
      setClientProjects(projects.filter((p) => p.clientId === client.id))
    } catch (error) {
      console.error("Failed to refresh client projects:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a lista de projetos do cliente.",
        variant: "destructive",
      })
    }
  }

  const handleClientFormSuccess = () => {
    setShowEditClientModal(false)
    toast({ title: "Sucesso!", description: "Dados do cliente atualizados." })
    refreshClientData()
  }

  const handleProjectFormSuccess = () => {
    setShowProjectFormModal(false)
    setEditingProject(null)
    toast({ title: "Sucesso!", description: "Projeto salvo." })
    refreshClientProjects()
  }

  const handleEditClient = () => {
    setShowEditClientModal(true)
  }

  const handleAddNewProject = () => {
    setEditingProject(null)
    setShowProjectFormModal(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowProjectFormModal(true)
  }

  const clientTypeLabels: Record<NonNullable<Client["clientType"]>, string> = {
    empresa: "Empresa",
    pessoa_singular: "Pessoa Singular",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/clientes">
            <Button variant="outline" size="icon" aria-label="Voltar para clientes">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCircle className="h-8 w-8 text-primary" />
            {client.name}
          </h1>
          <Badge variant="secondary" className="text-sm">
            {client.clientNumber}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditClient}>
            <Edit className="mr-2 h-4 w-4" /> Editar Cliente
          </Button>
          <Button onClick={handleAddNewProject}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Projeto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
          <CardDescription>Detalhes de contato, fiscais e da empresa.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 text-sm">
          <div className="space-y-3">
            <h4 className="font-medium text-base text-primary">Identificação</h4>
            <div className="flex items-center">
              <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Nº Cliente:</span>
              {client.clientNumber}
            </div>
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">NIF:</span>
              {client.nif || "Não informado"}
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Tipo:</span>
              {client.clientType ? clientTypeLabels[client.clientType] : "Não especificado"}
            </div>
            {client.clientType === "empresa" && client.responsibleName && (
              <div className="flex items-center">
                <UserCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground font-medium mr-1">Responsável:</span>
                {client.responsibleName}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-base text-primary">Contato</h4>
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Email:</span>
              <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                {client.email}
              </a>
            </div>
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Telefone:</span>
              {client.phone || "Não informado"}
            </div>
            {client.clientType === "empresa" && (
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground font-medium mr-1">Empresa (Fantasia):</span>
                {client.company || "Não informado"}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-base text-primary">Histórico</h4>
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Cliente desde:</span>
              {format(new Date(client.createdAt), "dd/MM/yyyy", { locale: ptBR })}
            </div>
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium mr-1">Última Atualização:</span>
              {format(new Date(client.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Projetos Associados</h2>
        </div>
        <ProjectList
          projects={clientProjects}
          clients={[{ id: client.id, name: client.name }]}
          onEditProject={handleEditProject}
        />
      </div>

      <Dialog open={showEditClientModal} onOpenChange={setShowEditClientModal}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl [&>.absolute.right-4.top-4]:hidden">
          <ClientForm
            client={client}
            onFormSubmit={handleClientFormSuccess}
            onCancel={() => setShowEditClientModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showProjectFormModal} onOpenChange={setShowProjectFormModal}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl">
          <ProjectForm
            project={editingProject}
            onFormSubmit={handleProjectFormSuccess}
            onCancel={() => {
              setShowProjectFormModal(false)
              setEditingProject(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
