"use client"

import { CardContent } from "@/components/ui/card"
import Link from "next/link" // Adicionar import
import { Button } from "@/components/ui/button" // Adicionar import
import { useState } from "react"
import { RolePermissionsForm } from "@/components/role-permissions-form"
import type { Employee } from "@/lib/types"
import { ShieldCheck, ArrowLeft } from "lucide-react" // Adicionar ArrowLeft
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Simulação: apenas admin pode acessar esta página.
// Em uma app real, isso seria protegido por rota/middleware.
const LOGGED_IN_USER_ROLE: Employee["role"] = "admin"

export default function NiveisAcessoPage() {
  const [selectedRole, setSelectedRole] = useState<Employee["role"]>("manager")

  if (LOGGED_IN_USER_ROLE !== "admin") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/configuracoes" passHref>
            <Button variant="outline" size="icon" aria-label="Voltar para Configurações">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-destructive" />
            <h1 className="text-3xl font-bold tracking-tight">Acesso Negado</h1>
          </div>
        </div>
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/configuracoes" passHref>
          <Button variant="outline" size="icon" aria-label="Voltar para Configurações">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Níveis de Acesso e Permissões</h1>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Permissões por Nível de Acesso</CardTitle>
          <CardDescription>
            Defina quais ações cada nível de acesso pode realizar no sistema. As permissões do nível "Administrador" são
            fixas e garantem acesso total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="manager"
            className="w-full"
            onValueChange={(value) => setSelectedRole(value as Employee["role"])}
          >
            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
              <TabsTrigger value="admin">Administrador</TabsTrigger>
              <TabsTrigger value="manager">Gerente</TabsTrigger>
              <TabsTrigger value="member">Membro</TabsTrigger>
            </TabsList>
            <TabsContent value="admin" className="mt-6">
              <RolePermissionsForm role="admin" />
            </TabsContent>
            <TabsContent value="manager" className="mt-6">
              <RolePermissionsForm role="manager" />
            </TabsContent>
            <TabsContent value="member" className="mt-6">
              <RolePermissionsForm role="member" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
