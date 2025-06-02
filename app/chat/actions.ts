"use server"

import { revalidatePath } from "next/cache"
import { updateEmployeeChatStatus } from "@/app/data"
import type { UserChatStatus, Employee } from "@/lib/types"

// Simulação do ID do usuário logado. Em um app real, viria da sessão.
const LOGGED_IN_USER_ID = "emp1" // Admin Acioli (para teste)

export interface ChatStatusUpdateResult {
  success: boolean
  message: string
  updatedUser?: Employee | null
}

export async function updateMyChatStatusAction(newStatus: UserChatStatus): Promise<ChatStatusUpdateResult> {
  try {
    const updatedUser = await updateEmployeeChatStatus(LOGGED_IN_USER_ID, newStatus)
    if (updatedUser) {
      revalidatePath("/chat") // Revalida a página do chat para refletir a mudança
      return { success: true, message: "Status atualizado com sucesso!", updatedUser }
    }
    return { success: false, message: "Usuário não encontrado." }
  } catch (error) {
    console.error("Erro ao atualizar status do chat:", error)
    return { success: false, message: "Falha ao atualizar status." }
  }
}
