"use client"

import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  createEmployeeAction,
  updateEmployeeAction,
  type EmployeeFormState,
} from "@/app/configuracoes/empregados/actions"
import type { Employee } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { X } from "lucide-react"

interface EmployeeFormProps {
  employee?: Employee | null
  onFormSubmit?: () => void
  onCancel?: () => void
}

const initialState: EmployeeFormState = {
  message: null,
  type: null,
  errors: {},
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (isEditing ? "Salvando..." : "Criando...") : isEditing ? "Salvar Alterações" : "Criar Empregado"}
    </Button>
  )
}

export function EmployeeForm({ employee, onFormSubmit, onCancel }: EmployeeFormProps) {
  const isEditing = !!employee
  const action = isEditing ? updateEmployeeAction.bind(null, employee.id) : createEmployeeAction
  const [state, formAction] = useActionState(action, initialState)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.type === "success") {
      toast({ title: "Sucesso!", description: state.message })
      if (onFormSubmit) onFormSubmit()
      if (!isEditing) formRef.current?.reset()
    } else if (state?.type === "error") {
      toast({ title: "Erro!", description: state.message || "Ocorreu um erro.", variant: "destructive" })
    }
  }, [state, toast, onFormSubmit, isEditing])

  return (
    <Card className="w-full max-w-lg mx-auto">
      <form action={formAction} ref={formRef}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{isEditing ? "Editar Empregado" : "Novo Empregado"}</CardTitle>
            {onCancel && (
              <Button variant="ghost" size="icon" type="button" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            {isEditing ? "Atualize os dados do empregado." : "Preencha os dados para cadastrar um novo empregado."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" name="name" defaultValue={employee?.name} required />
            {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={employee?.email} required />
            {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="role">Nível de Acesso</Label>
              <Select name="role" defaultValue={employee?.role} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              {state?.errors?.role && <p className="text-sm text-red-500">{state.errors.role[0]}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="department">Departamento (opcional)</Label>
              <Input id="department" name="department" defaultValue={employee?.department} />
              {state?.errors?.department && <p className="text-sm text-red-500">{state.errors.department[0]}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="position">Cargo (opcional)</Label>
            <Input id="position" name="position" defaultValue={employee?.position} />
            {state?.errors?.position && <p className="text-sm text-red-500">{state.errors.position[0]}</p>}
          </div>
          {isEditing && (
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                name="isActive"
                checked={employee?.isActive}
                defaultChecked={employee?.isActive === undefined ? true : employee.isActive} // Garante que o switch tenha um valor
                value={employee?.isActive ? "true" : "false"} // Envia 'true' ou 'false' como string
              />
              <Label htmlFor="isActive">Empregado Ativo</Label>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
          {onCancel && !isEditing && (
            <Button variant="outline" type="button" onClick={onCancel} className="w-full sm:w-auto">
              Cancelar
            </Button>
          )}
          <SubmitButton isEditing={isEditing} />
        </CardFooter>
      </form>
    </Card>
  )
}
