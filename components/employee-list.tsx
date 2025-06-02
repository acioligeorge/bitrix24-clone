"use client"

import type { Employee } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { deleteEmployeeAction, updateEmployeeAction } from "@/app/configuracoes/empregados/actions" // updateEmployeeAction para ativar/desativar
import { useToast } from "@/components/ui/use-toast"

interface EmployeeListProps {
  employees: Employee[]
  onEditEmployee: (employee: Employee) => void
  onToggleActive?: (employee: Employee) => void // Para ativar/desativar rapidamente
}

export function EmployeeList({ employees, onEditEmployee, onToggleActive }: EmployeeListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const { toast } = useToast()

  const handleDeleteRequest = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (employeeToDelete) {
      const result = await deleteEmployeeAction(employeeToDelete.id)
      if (result.type === "success") {
        toast({ title: "Sucesso!", description: result.message })
      } else {
        toast({ title: "Erro!", description: result.message, variant: "destructive" })
      }
      setEmployeeToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleToggleActive = async (employee: Employee) => {
    // Criar um FormData simulado para a action
    const formData = new FormData()
    formData.append("name", employee.name)
    formData.append("email", employee.email)
    formData.append("role", employee.role)
    if (employee.department) formData.append("department", employee.department)
    if (employee.position) formData.append("position", employee.position)
    formData.append("isActive", String(!employee.isActive)) // Inverte o status atual

    const result = await updateEmployeeAction(employee.id, undefined, formData)
    if (result.type === "success") {
      toast({
        title: "Sucesso!",
        description: `Empregado ${!employee.isActive ? "ativado" : "desativado"} com sucesso.`,
      })
      if (onToggleActive) onToggleActive(employee) // Chama callback para re-fetch se necessário
    } else {
      toast({ title: "Erro!", description: result.message || "Falha ao atualizar status.", variant: "destructive" })
    }
  }

  if (!employees || employees.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum empregado cadastrado ainda.</p>
  }

  const roleLabels: Record<Employee["role"], string> = {
    admin: "Admin",
    manager: "Gerente",
    member: "Membro",
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Cargo</TableHead>
            <TableHead>Nível</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell className="hidden md:table-cell">{employee.email}</TableCell>
              <TableCell className="hidden lg:table-cell">{employee.position || "-"}</TableCell>
              <TableCell>{roleLabels[employee.role]}</TableCell>
              <TableCell>
                <Badge
                  variant={employee.isActive ? "default" : "outline"}
                  className={
                    employee.isActive ? "bg-green-500 hover:bg-green-600 text-white" : "border-red-500 text-red-500"
                  }
                >
                  {employee.isActive ? "Ativo" : "Inativo"}
                </Badge>
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
                    <DropdownMenuItem onClick={() => onEditEmployee(employee)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(employee)}>
                      {employee.isActive ? (
                        <UserX className="mr-2 h-4 w-4 text-red-500" />
                      ) : (
                        <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                      )}
                      {employee.isActive ? "Desativar" : "Ativar"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteRequest(employee)}
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o empregado "{employeeToDelete?.name}" e
              removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmployeeToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
