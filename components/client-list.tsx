"use client"

import { DropdownMenuContent } from "@/components/ui/dropdown-menu"

import type { Client } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
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
import { deleteClientAction } from "@/app/clientes/actions"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface ClientListProps {
  clients: Client[]
  onEditClient: (client: Client) => void
}

export function ClientList({ clients, onEditClient }: ClientListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const { toast } = useToast()

  const handleDeleteRequest = (client: Client) => {
    setClientToDelete(client)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (clientToDelete) {
      const result = await deleteClientAction(clientToDelete.id)
      if (result.type === "success") {
        toast({ title: "Sucesso!", description: result.message })
      } else {
        toast({ title: "Erro!", description: result.message, variant: "destructive" })
      }
      setClientToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  if (!clients || clients.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum cliente cadastrado ainda.</p>
  }

  const clientTypeLabels: Record<NonNullable<Client["clientType"]>, string> = {
    empresa: "Empresa",
    pessoa_singular: "Pessoa Singular",
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Nº Cliente</TableHead>
            <TableHead>Nome / Razão Social</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">NIF</TableHead>
            <TableHead className="hidden sm:table-cell">Tipo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.clientNumber}</TableCell>
              <TableCell className="font-medium">
                <Link href={`/clientes/${client.id}`} className="hover:underline text-primary">
                  {client.name}
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell">{client.email}</TableCell>
              <TableCell className="hidden lg:table-cell">{client.nif || "-"}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {client.clientType ? (
                  <Badge variant={client.clientType === "empresa" ? "default" : "secondary"}>
                    {clientTypeLabels[client.clientType]}
                  </Badge>
                ) : (
                  "-"
                )}
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
                    <Link href={`/clientes/${client.id}`} passHref>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => onEditClient(client)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteRequest(client)}
                      className="text-red-600 hover:!text-red-600 hover:!bg-red-50 dark:hover:!bg-red-900/50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente "{clientToDelete?.name}" e
              removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClientToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
