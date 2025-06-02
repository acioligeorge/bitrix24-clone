"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ProjectList } from "@/components/project-list"
import { ProjectForm } from "@/components/project-form"
import { getProjects, getClients } from "@/app/data"
import type { Project, Client } from "@/lib/types"
import { PlusCircle, Briefcase } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Pick<Client, "id" | "name">[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [fetchedProjects, fetchedClients] = await Promise.all([
        getProjects(),
        getClients().then((cls) => cls.map((c) => ({ id: c.id, name: c.name }))),
      ])
      setProjects(fetchedProjects)
      setClients(fetchedClients)
    } catch (error) {
      console.error("Erro ao buscar dados de projetos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleFormSuccess = () => {
    setShowFormModal(false)
    setEditingProject(null)
    fetchData()
  }

  const handleAddNewProject = () => {
    setEditingProject(null)
    setShowFormModal(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowFormModal(true)
  }

  const handleCloseModal = () => {
    setShowFormModal(false)
    setEditingProject(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Projetos</h1>
        </div>
        <Button onClick={handleAddNewProject}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Projeto
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ProjectList projects={projects} clients={clients} onEditProject={handleEditProject} />
      )}

      <Dialog
        open={showFormModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleCloseModal()
          else setShowFormModal(true)
        }}
      >
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl [&>.absolute.right-4.top-4]:hidden">
          <ProjectForm project={editingProject} onFormSubmit={handleFormSuccess} onCancel={handleCloseModal} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
