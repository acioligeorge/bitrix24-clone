"use server"

import { revalidatePath } from "next/cache"
import {
  createTask as dbCreateTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  getTaskById as dbGetTaskById,
  getProjects as dbGetProjects, // Para popular select de projetos
  getEmployees as dbGetEmployees, // Para popular select de responsáveis
} from "@/app/data"
import type { Task, Project, Employee } from "@/lib/types"
import { parseISO } from "date-fns"

export interface TaskFormState {
  message: string | null
  type: "success" | "error" | null
  errors?: {
    title?: string[]
    projectId?: string[]
    assigneeId?: string[]
    status?: string[]
    priority?: string[]
    dueDate?: string[]
  }
}

export async function getProjectsForSelect(): Promise<Pick<Project, "id" | "name">[]> {
  const projects = await dbGetProjects()
  return projects.map((p) => ({ id: p.id, name: p.name }))
}

export async function getEmployeesForSelect(): Promise<Pick<Employee, "id" | "name">[]> {
  const employees = (await dbGetEmployees()).filter((emp) => emp.isActive) // Apenas ativos
  return employees.map((e) => ({ id: e.id, name: e.name }))
}

export async function createTaskAction(
  prevState: TaskFormState | undefined,
  formData: FormData,
): Promise<TaskFormState> {
  const title = formData.get("title") as string
  const description = formData.get("description") as string | undefined
  const projectId = formData.get("projectId") as string
  const assigneeId = formData.get("assigneeId") as string | undefined
  const status = formData.get("status") as Task["status"]
  const priority = formData.get("priority") as Task["priority"]
  const dueDateStr = formData.get("dueDate") as string | undefined

  const errors: TaskFormState["errors"] = {}
  if (!title || title.trim().length < 3) errors.title = ["Título é obrigatório (mín. 3 caracteres)."]
  if (!projectId) errors.projectId = ["Projeto é obrigatório."]
  if (!status) errors.status = ["Status é obrigatório."]
  if (!priority) errors.priority = ["Prioridade é obrigatória."]

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
    await dbCreateTask({
      title,
      description,
      projectId,
      assigneeId: assigneeId || null,
      status,
      priority,
      dueDate,
    })
    revalidatePath("/tarefas")
    if (projectId) revalidatePath(`/projetos/${projectId}`) // Se tivermos uma página de detalhes do projeto
    return { message: "Tarefa criada com sucesso!", type: "success" }
  } catch (e) {
    return { message: "Falha ao criar tarefa.", type: "error" }
  }
}

export async function updateTaskAction(
  id: string,
  prevState: TaskFormState | undefined,
  formData: FormData,
): Promise<TaskFormState> {
  const title = formData.get("title") as string
  const description = formData.get("description") as string | undefined
  const projectId = formData.get("projectId") as string
  const assigneeId = formData.get("assigneeId") as string | undefined
  const status = formData.get("status") as Task["status"]
  const priority = formData.get("priority") as Task["priority"]
  const dueDateStr = formData.get("dueDate") as string | undefined

  const errors: TaskFormState["errors"] = {}
  if (!title || title.trim().length < 3) errors.title = ["Título é obrigatório (mín. 3 caracteres)."]
  if (!projectId) errors.projectId = ["Projeto é obrigatório."]
  if (!status) errors.status = ["Status é obrigatório."]
  if (!priority) errors.priority = ["Prioridade é obrigatória."]

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
    const updated = await dbUpdateTask(id, {
      title,
      description,
      projectId,
      assigneeId: assigneeId || null,
      status,
      priority,
      dueDate,
    })
    if (!updated) {
      return { message: "Tarefa não encontrada.", type: "error" }
    }
    revalidatePath("/tarefas")
    if (projectId) revalidatePath(`/projetos/${projectId}`)
    return { message: "Tarefa atualizada com sucesso!", type: "success" }
  } catch (e) {
    return { message: "Falha ao atualizar tarefa.", type: "error" }
  }
}

export async function deleteTaskAction(id: string): Promise<{ message: string; type: "success" | "error" }> {
  try {
    const success = await dbDeleteTask(id)
    if (!success) {
      return { message: "Tarefa não encontrada ou já deletada.", type: "error" }
    }
    revalidatePath("/tarefas")
    // Poderia revalidar a página do projeto também, se necessário
    return { message: "Tarefa deletada com sucesso!", type: "success" }
  } catch (e) {
    return { message: "Falha ao deletar tarefa.", type: "error" }
  }
}

export async function getTaskAction(id: string): Promise<Task | null> {
  try {
    const task = await dbGetTaskById(id)
    return task || null
  } catch (e) {
    console.error("Falha ao buscar tarefa:", e)
    return null
  }
}
