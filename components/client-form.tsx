"use client"

import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientAction, updateClientAction, type ClientFormState } from "@/app/clientes/actions"
import type { Client } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { X } from "lucide-react"
import { CountryCodeSelect } from "./country-code-select"
import { countries } from "@/lib/country-data"

interface ClientFormProps {
  client?: Client | null
  onFormSubmit?: () => void
  onCancel?: () => void
}

const initialState: ClientFormState = {
  message: null,
  type: null,
  errors: {},
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (isEditing ? "Salvando..." : "Criando...") : isEditing ? "Salvar Alterações" : "Criar Cliente"}
    </Button>
  )
}

export function ClientForm({ client, onFormSubmit, onCancel }: ClientFormProps) {
  const isEditing = !!client
  const action = isEditing ? updateClientAction.bind(null, client?.id || "") : createClientAction
  const [state, formAction] = useActionState(action, initialState)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  const [selectedClientType, setSelectedClientType] = useState<Client["clientType"] | undefined>(client?.clientType)
  const [dialCode, setDialCode] = useState<string>("+351") // Default para Portugal
  const [phoneNumber, setPhoneNumber] = useState<string>("")

  useEffect(() => {
    if (client?.phone) {
      let foundDialCode = false
      // Tenta encontrar o DDI mais longo que corresponde ao início do número de telefone
      const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length)
      for (const country of sortedCountries) {
        if (client.phone.startsWith(country.dialCode)) {
          setDialCode(country.dialCode)
          setPhoneNumber(client.phone.substring(country.dialCode.length))
          foundDialCode = true
          break
        }
      }
      if (!foundDialCode) {
        // Se nenhum DDI conhecido for encontrado, assume o DDI padrão e o número completo
        setPhoneNumber(client.phone)
      }
    } else {
      setDialCode("+351") // Reset para o padrão se não houver cliente ou telefone
      setPhoneNumber("")
    }
    setSelectedClientType(client?.clientType)
  }, [client])

  useEffect(() => {
    if (state?.type === "success") {
      toast({
        title: "Sucesso!",
        description: state.message,
        variant: "default",
      })
      if (onFormSubmit) onFormSubmit()
      if (!isEditing) {
        formRef.current?.reset()
        setSelectedClientType(undefined)
        setDialCode("+351")
        setPhoneNumber("")
      }
    } else if (state?.type === "error") {
      toast({
        title: "Erro!",
        description: state.message || "Ocorreu um erro.",
        variant: "destructive",
      })
    }
  }, [state, toast, onFormSubmit, isEditing])

  const handleFormAction = (formData: FormData) => {
    // Adiciona o telefone completo (DDI + número) ao FormData
    formData.set("phone", dialCode + phoneNumber)
    formAction(formData)
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <form action={handleFormAction} ref={formRef}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
            {onCancel && (
              <Button variant="ghost" size="icon" type="button" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            {isEditing ? "Atualize os dados do cliente." : "Preencha os dados para cadastrar um novo cliente."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="clientNumber">Número do Cliente</Label>
              <Input id="clientNumber" name="clientNumber" defaultValue={client?.clientNumber} required />
              {state?.errors?.clientNumber && <p className="text-sm text-red-500">{state.errors.clientNumber[0]}</p>}
              {!isEditing && (
                <p className="text-xs text-muted-foreground">Ex: C001. Pode ser gerado automaticamente.</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="nif">NIF (opcional)</Label>
              <Input
                id="nif"
                name="nif"
                defaultValue={client?.nif}
                placeholder="Máx. 9 dígitos"
                maxLength={9}
                pattern="\d{0,9}" // Permite vazio ou até 9 dígitos
                title="NIF deve conter até 9 números."
              />
              {state?.errors?.nif && <p className="text-sm text-red-500">{state.errors.nif[0]}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="name">Nome Completo / Razão Social</Label>
            <Input id="name" name="name" defaultValue={client?.name} required />
            {state?.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="clientType">Tipo de Cliente</Label>
              <Select
                name="clientType"
                value={selectedClientType || ""}
                onValueChange={(value) => setSelectedClientType(value as Client["clientType"])}
                defaultValue={client?.clientType || ""}
              >
                <SelectTrigger id="clientType">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_especificado">Não especificado</SelectItem>
                  <SelectItem value="empresa">Empresa</SelectItem>
                  <SelectItem value="pessoa_singular">Pessoa Singular</SelectItem>
                </SelectContent>
              </Select>
              {state?.errors?.clientType && <p className="text-sm text-red-500">{state.errors.clientType[0]}</p>}
            </div>
            {selectedClientType === "empresa" && (
              <div className="space-y-1">
                <Label htmlFor="responsibleName">Nome do Responsável (Empresa)</Label>
                <Input id="responsibleName" name="responsibleName" defaultValue={client?.responsibleName} />
                {state?.errors?.responsibleName && (
                  <p className="text-sm text-red-500">{state.errors.responsibleName[0]}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email de Contato</Label>
            <Input id="email" name="email" type="email" defaultValue={client?.email} required />
            {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="phone-number">Telefone (opcional)</Label>
              <div className="flex gap-2">
                <CountryCodeSelect value={dialCode} onChange={setDialCode} />
                <Input
                  id="phone-number"
                  name="phone-number" // Este nome não será usado diretamente pela action, é para o input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} // Permite apenas números
                  placeholder="Número"
                  className="flex-1"
                />
              </div>
              {/* O input 'phone' real é hidden e preenchido programaticamente */}
              <input type="hidden" name="phone" value={dialCode + phoneNumber} />
              {state?.errors?.phone && <p className="text-sm text-red-500">{state.errors.phone[0]}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="company">Nome Fantasia (se Empresa)</Label>
              <Input id="company" name="company" defaultValue={client?.company} />
              {state?.errors?.company && <p className="text-sm text-red-500">{state.errors.company[0]}</p>}
            </div>
          </div>
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
