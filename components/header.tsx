"use client" // Adicionar "use client" se ainda não estiver presente para useTheme

import Link from "next/link" // Importar Link
import { useTheme } from "next-themes" // Importar useTheme
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub, // Importar DropdownMenuSub
  DropdownMenuSubTrigger, // Importar DropdownMenuSubTrigger
  DropdownMenuPortal, // Importar DropdownMenuPortal
  DropdownMenuSubContent, // Importar DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { Bell, Search, User, LogOut, Sun, Moon, Laptop, Settings } from "lucide-react" // Importar ícones
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { getEmployeeById } from "@/app/data" // Supondo que esta função possa ser chamada no cliente ou você tem uma action
import type { Employee } from "@/lib/types"

export function Header() {
  const { setTheme } = useTheme()
  const [loggedInUser, setLoggedInUser] = useState<Employee | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  // Simulação de busca do usuário logado (emp3 - Ana Pereira)
  // Em um app real, isso viria de um contexto de autenticação
  useEffect(() => {
    async function fetchUser() {
      setIsLoadingUser(true)
      try {
        // A função getEmployeeById é async, mas como estamos em "use client"
        // e ela lê de 'app/data.ts' que é compartilhado, isso pode funcionar em next-lite.
        // Para uma arquitetura mais robusta, seria uma API route ou Server Action.
        const user = await getEmployeeById("emp3") // ID do usuário logado fixo
        setLoggedInUser(user || null)
      } catch (error) {
        console.error("Failed to fetch logged in user for header:", error)
        setLoggedInUser(null)
      } finally {
        setIsLoadingUser(false)
      }
    }
    fetchUser()
  }, [])

  const avatarSrc = loggedInUser?.avatarUrl || "/placeholder.svg?height=32&width=32"
  const avatarFallbackText = loggedInUser?.name?.substring(0, 2)?.toUpperCase() || "US"

  return (
    <header className="fixed top-0 z-30 w-full p-4 border-b bg-background sm:ml-64">
      <div className="flex items-center justify-between">
        <div className="relative sm:w-64 md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <Input type="search" placeholder="Buscar tarefas, projetos, clientes..." className="pl-10" />
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notificações</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {!isLoadingUser && (
                    <AvatarImage
                      src={avatarSrc || "/placeholder.svg"}
                      alt={loggedInUser?.name || "Avatar do usuário"}
                    />
                  )}
                  <AvatarFallback>{isLoadingUser ? "" : avatarFallbackText}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/perfil" passHref>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="ml-1">Tema</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 h-4 w-4" />
                      Claro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 h-4 w-4" />
                      Escuro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Laptop className="mr-2 h-4 w-4" />
                      Sistema
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              {/* O item de Configurações pode ser mantido aqui ou movido para a página de Perfil */}
              <Link href="/configuracoes" passHref>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {" "}
                {/* Adicionar onClick para ação de logout no futuro */}
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
