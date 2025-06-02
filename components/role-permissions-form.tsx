"use client"

import { useState, useEffect, useTransition } from "react"
import type { Employee, Permission, PermissionId } from "@/lib/types"
import {
  getAllPermissionsAction,
  getPermissionsForRoleAction,
  updateRolePermissionsAction,
} from "@/app/configuracoes/acesso/actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ShieldCheck } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface RolePermissionsFormProps {
  role: Employee["role"]
}

export function RolePermissionsForm({ role }: RolePermissionsFormProps) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<Set<PermissionId>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const [fetchedAllPermissions, fetchedRolePermissions] = await Promise.all([
        getAllPermissionsAction(),
        getPermissionsForRoleAction(role),
      ])
      setAllPermissions(fetchedAllPermissions)
      setRolePermissions(new Set(fetchedRolePermissions))
      setIsLoading(false)
    }
    fetchData()
  }, [role])

  const handlePermissionChange = (permissionId: PermissionId, checked: boolean) => {
    setRolePermissions((prev) => {
      const newPermissions = new Set(prev)
      if (checked) {
        newPermissions.add(permissionId)
      } else {
        newPermissions.delete(permissionId)
      }
      return newPermissions
    })
  }

  const handleSubmit = async () => {
    startTransition(async () => {
      const result = await updateRolePermissionsAction(role, Array.from(rolePermissions))
      toast({
        title: result.type === "success" ? "Sucesso!" : "Erro!",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      })
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const groupedPermissions = allPermissions.reduce(
    (acc, permission) => {
      const module = permission.module || "Outros"
      if (!acc[module]) {
        acc[module] = []
      }
      acc[module].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  const roleNameMapping = {
    admin: "Administrador",
    manager: "Gerente",
    member: "Membro",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> Permissões para {roleNameMapping[role]}
        </CardTitle>
        <CardDescription>
          Selecione as permissões que o nível de acesso "{roleNameMapping[role]}" terá.
          {role === "admin" && " (Administradores têm todas as permissões por padrão e não podem ser alteradas aqui.)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={Object.keys(groupedPermissions)} className="w-full">
          {Object.entries(groupedPermissions).map(([moduleName, permissions]) => (
            <AccordionItem value={moduleName} key={moduleName}>
              <AccordionTrigger className="text-lg font-medium hover:no-underline">
                Módulo: {moduleName}
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                    <Checkbox
                      id={`${role}-${permission.id}`}
                      checked={rolePermissions.has(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                      disabled={role === "admin" || isSaving}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={`${role}-${permission.id}`} className="font-medium cursor-pointer">
                        {permission.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      {role !== "admin" && (
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Permissões
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
