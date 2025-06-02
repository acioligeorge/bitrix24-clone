import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, AlertTriangle, ArrowLeft } from "lucide-react" // Adicionar ArrowLeft
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FaturamentoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/configuracoes" passHref>
          <Button variant="outline" size="icon" aria-label="Voltar para Configurações">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Faturamento e Assinatura</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            Página em Construção
          </CardTitle>
          <CardDescription>
            Esta seção para gerenciar seu faturamento e assinatura ainda está em desenvolvimento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Em breve, você poderá visualizar seu plano atual, histórico de pagamentos, atualizar informações de cobrança
            e gerenciar sua assinatura diretamente aqui.
          </p>
          {/* O botão de voltar aqui foi removido, pois já existe o botão no topo */}
        </CardContent>
      </Card>
    </div>
  )
}
