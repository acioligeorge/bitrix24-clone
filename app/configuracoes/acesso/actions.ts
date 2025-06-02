"use server"

import { revalidatePath } from "next/cache"
import {
  getAllPermissions as dbGetAllPermissions,
  getPermissionsForRole as dbGetPermissionsForRole,
  updatePermissionsForRole as dbUpdatePermissionsForRole,
} from "@/app/data"
import type { Employee, Permission, PermissionId } from "@/lib/types"

export async function getAllPermissionsAction(): Promise<Permission[]> {
  return dbGetAllPermissions()
}

export async function getPermissionsForRoleAction(role: Employee["role"]): Promise<PermissionId[]> {
  return dbGetPermissionsForRole(role)
}

export interface UpdateRolePermissionsState {
  message: string | null
  type: "success" | "error" | null
  role?: Employee["role"]
}

export async function updateRolePermissionsAction(
  role: Employee["role"],
  permissionIds: PermissionId[],
): Promise<UpdateRolePermissionsState> {
  // Em uma app real, verificar se o usuário logado é admin
  if (role === "admin") {
    return { message: "Permissões de Administrador não podem ser alteradas por aqui.", type: "error", role }
  }
  try {
    await dbUpdatePermissionsForRole(role, permissionIds)
    revalidatePath("/configuracoes/acesso") // Pode não ser necessário se não houver re-fetch na página
    return { message: `Permissões para ${role} atualizadas com sucesso!`, type: "success", role }
  } catch (e) {
    return { message: "Falha ao atualizar permissões.", type: "error", role }
  }
}
