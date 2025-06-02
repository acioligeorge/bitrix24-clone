"use client"

import type { Project, Client } from "@/lib/types"
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
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react" // Alterado FolderKanban para Eye
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
import { deleteProjectAction } from "@/app/projetos/actions"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link" // Importar Link

interface ProjectListProps {
  projects: Project[]
  clients: Pick<Client, "id" | "name">[]
  onEditProject: (project: Project) => void
}

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

export function ProjectList({ projects, clients, onEditProject }: ProjectListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const { toast } = useToast()

  const getClientName = (clientId?: string | null) => clients.find((c) => c.id === clientId)?.name || "-"

  const handleDeleteRequest = (project: Project) => {
    setProjectToDelete(project)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (projectToDelete) {
      const result = await deleteProjectAction(projectToDelete.id)
      toast({
        title: result.type === "success" ? "Sucesso!" : "Erro!",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      })
      setProjectToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  if (!projects || projects.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum projeto cadastrado ainda.</p>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Projeto</TableHead>
            <TableHead className="hidden md:table-cell">Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Data de Entrega</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                <Link href={`/projetos/${project.id}`} className="hover:underline text-primary">
                  {project.name}
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell">{getClientName(project.clientId)}</TableCell>
              <TableCell>
                <Badge
                  className={`${projectStatusColors[project.status]} text-white hover:${projectStatusColors[project.status]}`}
                >
                  {projectStatusLabels[project.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {project.dueDate ? format(new Date(project.dueDate), "dd/MM/yyyy", { locale: ptBR }) : "-"}
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
                    <Link href={`/projetos/${project.id}`} passHref>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => onEditProject(project)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Projeto
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteRequest(project)}
                      className="text-red-600 hover:!text-red-600 hover:!bg-red-50 dark:hover:!bg-red-900/50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Projeto
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto "{projectToDelete?.name}" e todas
              as suas tarefas associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
