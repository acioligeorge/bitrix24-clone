"use client" // Necessário para useState, useEffect e manipulação de eventos

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ClientList } from "@/components/client-list"
import { ClientForm } from "@/components/client-form"
import { getClients } from "@/app/data" // Importa a função do data.ts
import type { Client } from "@/lib/types"
import { PlusCircle, Building2 } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton" // Para loading state

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const fetchedClients = await getClients() // Usa a função do data.ts
      setClients(fetchedClients)
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
      // Adicionar tratamento de erro para o usuário, se necessário
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, []) // Busca clientes ao montar o componente

  const handleFormSuccess = () => {
    setShowFormModal(false)
    setEditingClient(null)
    fetchClients() // Re-busca os clientes para atualizar a lista
  }

  const handleAddNewClient = () => {
    setEditingClient(null)
    setShowFormModal(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setShowFormModal(true)
  }

  const handleCloseModal = () => {
    setShowFormModal(false)
    setEditingClient(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
        </div>
        <Button onClick={handleAddNewClient}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ClientList clients={clients} onEditClient={handleEditClient} />
      )}

      <Dialog
        open={showFormModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleCloseModal()
          } else {
            setShowFormModal(true)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-xl [&>.absolute.right-4.top-4]:hidden">
          {/* ClientForm é renderizado aqui, mas o DialogHeader e Title são controlados pelo DialogContent */}
          {/* O título e descrição dentro do ClientForm serão usados */}
          <ClientForm client={editingClient} onFormSubmit={handleFormSuccess} onCancel={handleCloseModal} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
