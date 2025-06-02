import { Button } from "@/components/ui/button"
import { Settings, Users, Clock, ShieldCheck, CreditCard, UserCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const settingsModules = [
  {
    title: "Meu Perfil",
    description: "Visualize e edite suas informações pessoais e de conta.",
    icon: UserCircle,
    href: "/perfil",
    status: "Disponível",
  },
  {
    title: "Gestão de Empregados",
    description: "Adicione, edite e gerencie os usuários do sistema.",
    icon: Users,
    href: "/configuracoes/empregados",
    status: "Disponível",
  },
  {
    title: "Sistema de Ponto",
    description: "Controle o registro de ponto dos empregados.",
    icon: Clock,
    href: "/configuracoes/ponto",
    status: "Disponível",
  },
  {
    title: "Níveis de Acesso",
    description: "Defina permissões e papéis para os usuários.",
    icon: ShieldCheck,
    href: "/configuracoes/acesso",
    status: "Disponível",
  },
  {
    title: "Faturamento e Assinatura",
    description: "Gerencie sua assinatura e histórico de faturamento.",
    icon: CreditCard,
    href: "/configuracoes/faturamento",
    status: "Disponível",
  },
]

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsModules.map((module) => (
          <Card key={module.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <module.icon className="h-6 w-6 text-primary" />
                <CardTitle>{module.title}</CardTitle>
              </div>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Conteúdo específico do módulo pode vir aqui no futuro */}
            </CardContent>
            <div className="p-6 pt-0">
              {module.status === "Em desenvolvimento" ? (
                <Button variant="outline" className="w-full" disabled>
                  Em Breve
                </Button>
              ) : (
                <Link href={module.href} passHref>
                  <Button variant="outline" className="w-full">
                    Acessar
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
