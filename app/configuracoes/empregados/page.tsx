"use client"

import { useState, useEffect } from "react"
import Link from "next/link" // Adicionar import
import { Button } from "@/components/ui/button"
import { EmployeeList } from "@/components/employee-list"
import { EmployeeForm } from "@/components/employee-form"
import { getEmployees } from "@/app/data"
import type { Employee } from "@/lib/types"
import { PlusCircle, Users, ArrowLeft } from "lucide-react" // Adicionar ArrowLeft
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function EmpregadosPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const fetchEmployees = async () => {
    setIsLoading(true)
    try {
      const fetchedEmployees = await getEmployees()
      setEmployees(fetchedEmployees)
    } catch (error) {
      console.error("Erro ao buscar empregados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleFormSuccess = () => {
    setShowFormModal(false)
    setEditingEmployee(null)
    fetchEmployees()
  }

  const handleToggleActiveSuccess = () => {
    fetchEmployees() // Re-fetch para atualizar o status na lista
  }

  const handleAddNewEmployee = () => {
    setEditingEmployee(null)
    setShowFormModal(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setShowFormModal(true)
  }

  const handleCloseModal = () => {
    setShowFormModal(false)
    setEditingEmployee(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/configuracoes" passHref>
            <Button variant="outline" size="icon" aria-label="Voltar para Configurações">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Empregados</h1>
          </div>
        </div>
        <Button onClick={handleAddNewEmployee}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Empregado
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <EmployeeList
          employees={employees}
          onEditEmployee={handleEditEmployee}
          onToggleActive={handleToggleActiveSuccess}
        />
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
          <EmployeeForm employee={editingEmployee} onFormSubmit={handleFormSuccess} onCancel={handleCloseModal} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
