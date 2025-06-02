"use server"

import { revalidatePath } from "next/cache"
import { getEmployeeById, updateEmployee as dbUpdateEmployee } from "@/app/data"
import type { Employee } from "@/lib/types"

// Simulação do ID do empregado logado. Em uma app real, viria da sessão/auth.
const LOGGED_IN_EMPLOYEE_ID = "emp3"

export interface ProfileFormState {
  message: string | null
  type: "success" | "error" | null
  errors?: {
    name?: string[]
    email?: string[]
    department?: string[]
    position?: string[]
    newPassword?: string[]
    confirmPassword?: string[]
  }
}

export async function getUserProfileAction(): Promise<Employee | null> {
  try {
    const employee = await getEmployeeById(LOGGED_IN_EMPLOYEE_ID)
    return employee || null
  } catch (e) {
    console.error("Falha ao buscar perfil do usuário:", e)
    return null
  }
}

export async function updateUserProfileAction(
  prevState: ProfileFormState | undefined,
  formData: FormData,
): Promise<ProfileFormState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const department = formData.get("department") as string | undefined
  const position = formData.get("position") as string | undefined
  // Campos de senha (lógica de atualização de senha não implementada completamente)
  const newPassword = formData.get("newPassword") as string | undefined
  const confirmPassword = formData.get("confirmPassword") as string | undefined
  const avatarFile = formData.get("avatar") as File | null // Adicionar esta linha

  const errors: ProfileFormState["errors"] = {}
  if (!name || name.trim().length < 3) errors.name = ["Nome é obrigatório (mín. 3 caracteres)."]
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = ["Email inválido."]

  if (newPassword && newPassword.length < 6) {
    errors.newPassword = ["Nova senha deve ter pelo menos 6 caracteres."]
  }
  if (newPassword && newPassword !== confirmPassword) {
    errors.confirmPassword = ["As senhas não coincidem."]
  }

  if (Object.keys(errors).length > 0) {
    return { message: "Erro de validação.", type: "error", errors }
  }

  try {
    // A role e isActive não devem ser alteradas aqui.
    // A função dbUpdateEmployee precisa ser cuidadosa para não sobrescrever esses campos
    // se eles não forem explicitamente passados.
    // Por enquanto, vamos passar apenas os campos editáveis do perfil.
    const updateData: Partial<Omit<Employee, "id" | "createdAt" | "updatedAt" | "role" | "isActive">> = {
      name,
      email,
      department: department || "", // Enviar string vazia se undefined para limpar o campo
      position: position || "", // Enviar string vazia se undefined para limpar o campo
    }

    if (avatarFile && avatarFile.size > 0) {
      // Simulação de upload: Usaremos o nome do arquivo para gerar uma nova URL de placeholder.
      // Em um app real, você faria upload para um serviço de blob e obteria uma URL.
      // Para next-lite, você pode usar o componente AddIntegration para Vercel Blob.
      // Por enquanto, vamos simular.
      const newAvatarUrl = `/placeholder.svg?height=80&width=80&query=avatar+${name}+${Date.now()}` // Adiciona timestamp para forçar atualização
      updateData.avatarUrl = newAvatarUrl
    } else if (formData.get("removeAvatar") === "true") {
      updateData.avatarUrl = undefined // Ou uma URL de avatar padrão
    }

    // Lógica de atualização de senha seria aqui (hashing, etc.)
    // if (newPassword) { /* ... */ }

    const updated = await dbUpdateEmployee(LOGGED_IN_EMPLOYEE_ID, updateData)
    if (!updated) {
      return { message: "Usuário não encontrado.", type: "error" }
    }
    revalidatePath("/perfil")
    revalidatePath("/app/layout.tsx") // Para atualizar o header se o nome/avatar mudar
    return { message: "Perfil atualizado com sucesso!", type: "success" }
  } catch (e) {
    console.error("Falha ao atualizar perfil:", e)
    return { message: "Falha ao atualizar perfil.", type: "error" }
  }
}
