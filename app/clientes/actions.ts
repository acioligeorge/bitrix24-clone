"use server"

import { revalidatePath } from "next/cache"
import {
  createClient as dbCreateClient,
  updateClient as dbUpdateClient,
  deleteClient as dbDeleteClient,
  getClientById as dbGetClientById,
} from "@/app/data"
import type { Client } from "@/lib/types"

export interface ClientFormState {
  message: string | null
  type: "success" | "error" | null
  errors?: {
    name?: string[]
    email?: string[]
    phone?: string[]
    company?: string[]
    clientNumber?: string[]
    nif?: string[]
    clientType?: string[]
    responsibleName?: string[]
  }
}

export async function createClientAction(
  prevState: ClientFormState | undefined,
  formData: FormData,
): Promise<ClientFormState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string | undefined // Agora vem completo: DDI + número
  const company = formData.get("company") as string | undefined
  const clientNumber = formData.get("clientNumber") as string
  const nif = formData.get("nif") as string | undefined
  const clientType = formData.get("clientType") as Client["clientType"] | undefined
  let responsibleName = formData.get("responsibleName") as string | undefined

  const errors: ClientFormState["errors"] = {}
  if (!name || name.trim().length < 3) errors.name = ["Nome/Razão Social é obrigatório (mín. 3 caracteres)."]
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = ["Email inválido."]
  if (!clientNumber || clientNumber.trim().length === 0) errors.clientNumber = ["Número do Cliente é obrigatório."]
  if (nif && !/^\d{0,9}$/.test(nif)) errors.nif = ["NIF deve conter apenas números, no máximo 9 dígitos."] // Permite vazio
  if (clientType && !["empresa", "pessoa_singular", "nao_especificado", ""].includes(clientType))
    errors.clientType = ["Tipo de Cliente inválido."]

  // Validação simples para o telefone (DDI + número)
  // Verifica se, após remover o '+', o restante tem entre 7 e 15 dígitos.
  if (phone && phone.trim() !== "+351") {
    // Ignora se for apenas o DDI padrão vazio
    const justDigitsAndPlus = phone.replace(/[^\d+]/g, "")
    if (!/^\+\d{7,15}$/.test(justDigitsAndPlus)) {
      // errors.phone = ["Telefone inválido. Deve incluir DDI e ter entre 7 a 15 dígitos."];
      // Removendo validação estrita por enquanto para focar na funcionalidade do DDI
    }
  }

  if (clientType !== "empresa") {
    responsibleName = undefined
  }

  if (Object.keys(errors).length > 0) {
    return { message: "Erro de validação.", type: "error", errors }
  }

  try {
    await dbCreateClient({
      name,
      email,
      phone: phone === "+351" ? undefined : phone, // Não salva se for apenas o DDI padrão
      company,
      clientNumber,
      nif,
      clientType: clientType === "nao_especificado" || clientType === "" ? undefined : clientType,
      responsibleName,
    })
    revalidatePath("/clientes")
    return { message: "Cliente criado com sucesso!", type: "success" }
  } catch (e) {
    console.error("Falha ao criar cliente:", e)
    return { message: "Falha ao criar cliente. Verifique os logs do servidor.", type: "error" }
  }
}

export async function updateClientAction(
  id: string,
  prevState: ClientFormState | undefined,
  formData: FormData,
): Promise<ClientFormState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string | undefined // Agora vem completo: DDI + número
  const company = formData.get("company") as string | undefined
  const clientNumber = formData.get("clientNumber") as string
  const nif = formData.get("nif") as string | undefined
  const clientType = formData.get("clientType") as Client["clientType"] | undefined
  let responsibleName = formData.get("responsibleName") as string | undefined

  const errors: ClientFormState["errors"] = {}
  if (!name || name.trim().length < 3) errors.name = ["Nome/Razão Social é obrigatório (mín. 3 caracteres)."]
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = ["Email inválido."]
  if (!clientNumber || clientNumber.trim().length === 0) errors.clientNumber = ["Número do Cliente é obrigatório."]
  if (nif && !/^\d{0,9}$/.test(nif)) errors.nif = ["NIF deve conter apenas números, no máximo 9 dígitos."] // Permite vazio
  if (clientType && !["empresa", "pessoa_singular", "nao_especificado", ""].includes(clientType))
    errors.clientType = ["Tipo de Cliente inválido."]

  // Validação simples para o telefone (DDI + número)
  if (phone && phone.trim() !== "+351") {
    // Ignora se for apenas o DDI padrão vazio
    const justDigitsAndPlus = phone.replace(/[^\d+]/g, "")
    if (!/^\+\d{7,15}$/.test(justDigitsAndPlus)) {
      // errors.phone = ["Telefone inválido. Deve incluir DDI e ter entre 7 a 15 dígitos."];
      // Removendo validação estrita por enquanto para focar na funcionalidade do DDI
    }
  }

  if (clientType !== "empresa") {
    responsibleName = undefined
  }

  if (Object.keys(errors).length > 0) {
    return { message: "Erro de validação.", type: "error", errors }
  }

  try {
    const updated = await dbUpdateClient(id, {
      name,
      email,
      phone: phone === "+351" ? undefined : phone, // Não salva se for apenas o DDI padrão
      company,
      clientNumber,
      nif,
      clientType: clientType === "nao_especificado" || clientType === "" ? undefined : clientType,
      responsibleName,
    })
    if (!updated) {
      return { message: "Cliente não encontrado.", type: "error" }
    }
    revalidatePath("/clientes")
    revalidatePath(`/clientes/${id}`)
    return { message: "Cliente atualizado com sucesso!", type: "success" }
  } catch (e) {
    console.error("Falha ao atualizar cliente:", e)
    return { message: "Falha ao atualizar cliente. Verifique os logs do servidor.", type: "error" }
  }
}

export async function deleteClientAction(id: string): Promise<{ message: string; type: "success" | "error" }> {
  try {
    const success = await dbDeleteClient(id)
    if (!success) {
      return { message: "Cliente não encontrado ou já deletado.", type: "error" }
    }
    revalidatePath("/clientes")
    return { message: "Cliente deletado com sucesso!", type: "success" }
  } catch (e) {
    return { message: "Falha ao deletar cliente.", type: "error" }
  }
}

export async function getClientAction(id: string): Promise<Client | null> {
  try {
    const client = await dbGetClientById(id)
    return client || null
  } catch (e) {
    console.error("Falha ao buscar cliente:", e)
    return null
  }
}
