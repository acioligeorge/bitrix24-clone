"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Briefcase, CheckSquare, MessageSquare, Settings, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/clientes", label: "Clientes", icon: Building2 },
  { href: "/projetos", label: "Projetos", icon: Briefcase },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-background border-r sm:translate-x-0">
      <div className="h-full px-3 pb-4 overflow-y-auto">
        <Link href="/" className="flex items-center ps-2.5 mb-5">
          <Briefcase className="h-8 w-8 text-primary mr-2" />
          <span className="self-center text-xl font-semibold whitespace-nowrap text-primary">Acioli CRM</span>
        </Link>
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center p-2 text-foreground rounded-lg hover:bg-primary/10 group",
                  pathname === item.href ? "bg-primary/10 text-primary" : "hover:text-primary",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition duration-75 group-hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-gray-500 dark:text-gray-400",
                  )}
                />
                <span className="ms-3">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
