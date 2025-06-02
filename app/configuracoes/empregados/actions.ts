"use server"

import { revalidatePath } from "next/cache"
import {
  createEmployee as dbCreateEmployee,
  updateEmployee as dbUpdateEmployee,
  deleteEmployee as dbDeleteEmployee,
  getEmployeeById as dbGetEmployeeById,
} from "@/app/data"
import type { Employee } from "@/lib/types"

export interface EmployeeFormState {
  message: string | null
  type: "success" | "error" | null
  errors?: {
    name?: string[]
    email?: string[]
    role?: string[]
    department?: string[]
    position?: string[]
  }
}

export async function createEmployeeAction(
  prevState: EmployeeFormState | undefined,
  formData: FormData,
): Promise<EmployeeFormState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as Employee["role"]
  const department = formData.get("department") as string | undefined
  const position = formData.get("position") as string | undefined

  const errors: EmployeeFormState["errors"] = {}
  if (!name || name.trim().length < 3) errors.name = ["Nome é obrigatório (mín. 3 caracteres)."]
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = ["Email inválido."]
  if (!role || !["admin", "manager", "member"].includes(role)) errors.role = ["Nível de acesso inválido."]

  if (Object.keys(errors).length > 0) {
    return { message: "Erro de validação.", type: "error", errors }
  }

  try {
    await dbCreateEmployee({ name, email, role, department, position })
    revalidatePath("/configuracoes/empregados")
    return { message: "Empregado criado com sucesso!", type: "success" }
  } catch (e) {
    return { message: "Falha ao criar empregado.", type: "error" }
  }
}

export async function updateEmployeeAction(
  id: string,
  prevState: EmployeeFormState | undefined,
  formData: FormData,
): Promise<EmployeeFormState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as Employee["role"]
  const department = formData.get("department") as string | undefined
  const position = formData.get("position") as string | undefined
  const isActive = formData.get("isActive") === "true"

  const errors: EmployeeFormState["errors"] = {}
  if (!name || name.trim().length < 3) errors.name = ["Nome é obrigatório (mín. 3 caracteres)."]
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = ["Email inválido."]
  if (!role || !["admin", "manager", "member"].includes(role)) errors.role = ["Nível de acesso inválido."]

  if (Object.keys(errors).length > 0) {
    return { message: "Erro de validação.", type: "error", errors }
  }

  try {
    const updated = await dbUpdateEmployee(id, { name, email, role, department, position, isActive })
    if (!updated) {
      return { message: "Empregado não encontrado.", type: "error" }
    }
    revalidatePath("/configuracoes/empregados")
    return { message: "Empregado atualizado com sucesso!", type: "success" }
  } catch (e) {
    return { message: "Falha ao atualizar empregado.", type: "error" }
  }
}

export async function deleteEmployeeAction(id: string): Promise<{ message: string; type: "success" | "error" }> {
  try {
    const success = await dbDeleteEmployee(id)
    if (!success) {
      return { message: "Empregado não encontrado ou já deletado.", type: "error" }
    }
    revalidatePath("/configuracoes/empregados")
    return { message: "Empregado deletado com sucesso!", type: "success" }
  } catch (e) {
    return { message: "Falha ao deletar empregado.", type: "error" }
  }
}

export async function getEmployeeAction(id: string): Promise<Employee | null> {
  try {
    const employee = await dbGetEmployeeById(id)
    return employee || null
  } catch (e) {
    console.error("Falha ao buscar empregado:", e)
    return null
  }
}
