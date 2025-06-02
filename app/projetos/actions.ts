"use server"

import { revalidatePath } from "next/cache"
import {
  createProject as dbCreateProject,
  updateProject as dbUpdateProject,
  deleteProject as dbDeleteProject,
  getProjectById as dbGetProjectById,
  getClients, // Para popular o select de clientes
} from "@/app/data"
import type { Project, Client } from "@/lib/types"
import { parseISO } from "date-fns"

export interface ProjectFormState {
  message: string | null
  type: "success" | "error" | null
  errors?: {
    name?: string[]
    description?: string[]
    clientId?: string[]
    status?: string[]
    dueDate?: string[]
  }
}

export async function getClientsForSelect(): Promise<Pick<Client, "id" | "name">[]> {
  const clients = await getClients()
  return clients.map((c) => ({ id: c.id, name: c.name }))
}

export async function createProjectAction(
  prevState: ProjectFormState | undefined,
  formData: FormData,
): Promise<ProjectFormState> {
  const name = formData.get("name") as string
  const description = formData.get("description") as string | undefined
  const clientId = formData.get("clientId") as string | undefined
  const status = formData.get("status") as Project["status"]
  const dueDateStr = formData.get("dueDate") as string | undefined

  const errors: ProjectFormState["errors"] = {}
  if (!name || name.trim().length < 3) errors.name = ["Nome é obrigatório (mín. 3 caracteres)."]
  if (!status) errors.status = ["Status é obrigatório."]
  let dueDate: Date | null = null
  if (dueDateStr) {
    try {
      dueDate = parseISO(dueDateStr)
    } catch (e) {
      errors.dueDate = ["Data de entrega inválida."]
    }
  }

  if (Object.keys(errors).length > 0) {
    return { message: "Erro de validação.", type: "error", errors }
  }

  try {
    await dbCreateProject({
      name,
      description,
      clientId: clientId || null,
      status,
      dueDate,
    })
    revalidatePath("/projetos")
    return { message: "Projeto criado com sucesso!", type: "success" }
  } catch (e) {
    return { message: "Falha ao criar projeto.", type: "error" }
  }
}

export async function updateProjectAction(
  id: string,
  prevState: ProjectFormState | undefined,
  formData: FormData,
): Promise<ProjectFormState> {
  const name = formData.get("name") as string
  const description = formData.get("description") as string | undefined
  const clientId = formData.get("clientId") as string | undefined
  const status = formData.get("status") as Project["status"]
  const dueDateStr = formData.get("dueDate") as string | undefined

  const errors: ProjectFormState["errors"] = {}
  if (!name || name.trim().length < 3) errors.name = ["Nome é obrigatório (mín. 3 caracteres)."]
  if (!status) errors.status = ["Status é obrigatório."]
  let dueDate: Date | null = null
  if (dueDateStr) {
    try {
      dueDate = parseISO(dueDateStr)
    } catch (e) {
      errors.dueDate = ["Data de entrega inválida."]
    }
  }

  if (Object.keys(errors).length > 0) {
    return { message: "Erro de validação.", type: "error", errors }
  }

  try {
    const updated = await dbUpdateProject(id, {
      name,
      description,
      clientId: clientId || null,
      status,
      dueDate,
    })
    if (!updated) {
      return { message: "Projeto não encontrado.", type: "error" }
    }
    revalidatePath("/projetos")
    return { message: "Projeto atualizado com sucesso!", type: "success" }
  } catch (e) {
    return { message: "Falha ao atualizar projeto.", type: "error" }
  }
}

export async function deleteProjectAction(id: string): Promise<{ message: string; type: "success" | "error" }> {
  try {
    const success = await dbDeleteProject(id)
    if (!success) {
      return { message: "Projeto não encontrado ou já deletado.", type: "error" }
    }
    revalidatePath("/projetos")
    revalidatePath("/tarefas") // Tarefas podem ter sido deletadas
    return { message: "Projeto deletado com sucesso!", type: "success" }
  } catch (e) {
    return { message: "Falha ao deletar projeto.", type: "error" }
  }
}

export async function getProjectAction(id: string): Promise<Project | null> {
  try {
    const project = await dbGetProjectById(id)
    return project || null
  } catch (e) {
    console.error("Falha ao buscar projeto:", e)
    return null
  }
}
