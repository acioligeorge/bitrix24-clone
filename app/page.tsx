import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, CheckSquare } from "lucide-react"
import Image from "next/image"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center mb-4">
        <Image
          src="/logo.png"
          alt="Acioli CRM Logo"
          width={80} // Ajuste a largura conforme necessário
          height={80} // Ajuste a altura conforme necessário
          className="mb-2" // Adiciona um pouco de espaço abaixo do logo
        />
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard Acioli CRM</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-xs text-muted-foreground">+20.1% desde o mês passado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos em Andamento</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">+10% desde a semana passada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
            <p className="text-xs text-muted-foreground">+5 desde ontem</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Nenhuma atividade recente para mostrar.</p>
            {/* Aqui viria uma lista de atividades */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximos Prazos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Nenhum prazo iminente.</p>
            {/* Aqui viria uma lista de tarefas/projetos com prazos */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
