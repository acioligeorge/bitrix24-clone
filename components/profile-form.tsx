"use client"

import { useFormStatus } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { updateUserProfileAction, type ProfileFormState } from "@/app/perfil/actions"
import type { Employee } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, UserCircle, Lock } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { useActionState } from "react"

interface ProfileFormProps {
  employee: Employee
}

const initialState: ProfileFormState = {
  message: null,
  type: null,
  errors: {},
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Salvar Alterações
    </Button>
  )
}

export function ProfileForm({ employee }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateUserProfileAction, initialState)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false)

  // Refs para os campos de senha para poder limpá-los após sucesso
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state?.type === "success") {
      toast({
        title: "Sucesso!",
        description: state.message,
      })
      // Limpar campos de senha após sucesso
      if (newPasswordRef.current) newPasswordRef.current.value = ""
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = ""
      setRemoveAvatarFlag(false) // Resetar flag
    } else if (state?.type === "error") {
      toast({
        title: "Erro!",
        description: state.message || "Ocorreu um erro.",
        variant: "destructive",
      })
    }
  }, [state, toast])

  const avatarFallback = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <form action={formAction} ref={formRef}>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <ImageUpload
              name="avatar"
              currentImageUrl={employee.avatarUrl}
              defaultFallback={avatarFallback}
              onImageRemove={() => setRemoveAvatarFlag(true)} // Definir flag ao remover
            />
            <div>
              <CardTitle className="text-2xl text-center">{employee.name}</CardTitle>
              <CardDescription className="text-center">Atualize suas informações pessoais e de conta.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {removeAvatarFlag && <input type="hidden" name="removeAvatar" value="true" />}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <UserCircle className="mr-2 h-5 w-5 text-primary" />
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" defaultValue={employee.name} required />
                {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={employee.email} required />
                {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
                <p className="text-xs text-muted-foreground">Alterar o email pode afetar seu login.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="department">Departamento</Label>
                <Input id="department" name="department" defaultValue={employee.department} />
                {state?.errors?.department && <p className="text-sm text-red-500">{state.errors.department[0]}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="position">Cargo</Label>
                <Input id="position" name="position" defaultValue={employee.position} />
                {state?.errors?.position && <p className="text-sm text-red-500">{state.errors.position[0]}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium flex items-center">
              <Lock className="mr-2 h-5 w-5 text-primary" />
              Alterar Senha (Opcional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input id="newPassword" name="newPassword" type="password" ref={newPasswordRef} />
                {state?.errors?.newPassword && <p className="text-sm text-red-500">{state.errors.newPassword[0]}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" ref={confirmPasswordRef} />
                {state?.errors?.confirmPassword && (
                  <p className="text-sm text-red-500">{state.errors.confirmPassword[0]}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Deixe os campos de senha em branco se não desejar alterá-la.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  )
}
