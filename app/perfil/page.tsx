import { CardFooter } from "@/components/ui/card"
import { Suspense } from "react"
import Link from "next/link" // Adicionar import
import { Button } from "@/components/ui/button" // Adicionar import
import { getUserProfileAction } from "./actions"
import { ProfileForm } from "@/components/profile-form"
import { UserCircle, AlertTriangle, ArrowLeft } from "lucide-react" // Adicionar ArrowLeft
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function ProfilePageContent() {
  const employee = await getUserProfileAction()

  if (!employee) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-6 w-6" />
            Erro ao Carregar Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não foi possível carregar os dados do seu perfil. Por favor, tente novamente mais tarde.</p>
        </CardContent>
      </Card>
    )
  }

  return <ProfileForm employee={employee} />
}

export default function PerfilPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/configuracoes" passHref>
          <Button variant="outline" size="icon" aria-label="Voltar para Configurações">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <UserCircle className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        </div>
      </div>
      <Suspense
        fallback={
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="bg-muted animate-pulse rounded-full h-20 w-20" />
                <div>
                  <div className="bg-muted animate-pulse h-7 w-48 mb-1 rounded-md" />
                  <div className="bg-muted animate-pulse h-4 w-72 rounded-md" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-muted animate-pulse h-6 w-40 mb-2 rounded-md" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="bg-muted animate-pulse h-4 w-20 mb-1 rounded-md" />
                    <div className="bg-muted animate-pulse h-10 w-full rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <div className="bg-muted animate-pulse h-4 w-20 mb-1 rounded-md" />
                    <div className="bg-muted animate-pulse h-10 w-full rounded-md" />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <div className="bg-muted animate-pulse h-6 w-48 mb-2 rounded-md" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="bg-muted animate-pulse h-4 w-24 mb-1 rounded-md" />
                    <div className="bg-muted animate-pulse h-10 w-full rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <div className="bg-muted animate-pulse h-4 w-32 mb-1 rounded-md" />
                    <div className="bg-muted animate-pulse h-10 w-full rounded-md" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="bg-primary/50 animate-pulse h-10 w-36 rounded-md" />
            </CardFooter>
          </Card>
        }
      >
        <div className="max-w-2xl mx-auto">
          <ProfilePageContent />
        </div>
      </Suspense>
    </div>
  )
}
