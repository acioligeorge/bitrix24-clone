"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  clockInAction,
  clockOutAction,
  startPauseAction,
  endPauseAction,
  getMyOpenTimeRecordAndPauseAction,
} from "@/app/configuracoes/ponto/actions"
import type { TimeRecord, PauseRecord, PauseType } from "@/lib/types"
import { pauseTypeLabels } from "@/lib/types" // Importar labels
import { Loader2, LogIn, LogOut, Play, Square, Coffee, Users, Briefcase } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const pauseTypeIcons: Record<PauseType, React.ElementType> = {
  break: Coffee,
  reunion: Users,
  alignment: Briefcase,
}

export function TimeClockControls() {
  const [openRecord, setOpenRecord] = useState<TimeRecord | null>(null)
  const [openPause, setOpenPause] = useState<PauseRecord | null>(null)
  const [generalNotes, setGeneralNotes] = useState("") // Para clock-in/out
  const [pauseNotes, setPauseNotes] = useState("") // Para iniciar/terminar pausa
  const [selectedPauseType, setSelectedPauseType] = useState<PauseType>("break")
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const fetchCurrentState = async () => {
    setIsLoading(true)
    const { record, pause } = await getMyOpenTimeRecordAndPauseAction()
    setOpenRecord(record)
    setOpenPause(pause)
    setGeneralNotes(record?.notes || "") // Carregar notas do ponto aberto
    if (pause) {
      setSelectedPauseType(pause.pauseType) // Se houver pausa aberta, pré-selecionar seu tipo
      setPauseNotes(pause.notesStart || "") // Carregar notas da pausa aberta
    } else {
      setPauseNotes("") // Limpar notas de pausa se não houver pausa aberta
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCurrentState()
  }, [])

  const handleClockIn = () => {
    startTransition(async () => {
      const result = await clockInAction(generalNotes)
      toast({
        title: result.type === "success" ? "Sucesso!" : "Erro!",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      })
      if (result.type === "success") {
        setOpenRecord(result.openRecord || null)
        setOpenPause(result.openPause || null)
        if (!result.openRecord) setGeneralNotes("") // Limpar notas se o ponto foi fechado (não deve acontecer aqui)
      }
    })
  }

  const handleClockOut = () => {
    if (!openRecord) return
    startTransition(async () => {
      const result = await clockOutAction(openRecord.id, generalNotes)
      toast({
        title: result.type === "success" ? "Sucesso!" : "Erro!",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      })
      if (result.type === "success") {
        setOpenRecord(null)
        setOpenPause(null)
        setGeneralNotes("")
      }
    })
  }

  const handleStartPause = () => {
    if (!openRecord) return
    startTransition(async () => {
      const result = await startPauseAction(openRecord.id, selectedPauseType, pauseNotes)
      toast({
        title: result.type === "success" ? "Sucesso!" : "Erro!",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      })
      if (result.type === "success") {
        setOpenPause(result.openPause || null)
        // Não limpar pauseNotes aqui, pode ser útil se o usuário quiser adicionar mais
      }
    })
  }

  const handleEndPause = () => {
    if (!openPause) return
    startTransition(async () => {
      const result = await endPauseAction(openPause.id, pauseNotes) // Usar pauseNotes para notesEnd
      toast({
        title: result.type === "success" ? "Sucesso!" : "Erro!",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      })
      if (result.type === "success") {
        setOpenPause(null)
        setPauseNotes("") // Limpar notas após finalizar a pausa
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {openRecord
            ? `Ponto em Aberto (Entrada: ${format(new Date(openRecord.timestampIn), "HH:mm 'de' dd/MM/yy", { locale: ptBR })})`
            : "Registrar Ponto"}
        </CardTitle>
        <CardDescription>
          {openRecord
            ? "Gerencie seu ponto atual ou registre uma pausa."
            : "Clique em 'Registrar Entrada' para iniciar seu dia de trabalho."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seção de Clock In/Out */}
        {!openPause && ( // Só mostrar notas gerais e botão de saída se não estiver em pausa
          <div>
            <Label htmlFor="generalNotes">Observações Gerais (Entrada/Saída)</Label>
            <Textarea
              id="generalNotes"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Ex: Início de atividades, finalização do dia."
              rows={2}
              disabled={!!openRecord && !!openPause} // Desabilitar se estiver em pausa
            />
          </div>
        )}

        {openRecord && (
          <div className="space-y-4 p-4 border rounded-md bg-muted/30">
            <h4 className="font-semibold text-md">Controle de Pausas</h4>
            {openPause ? (
              <>
                <p className="text-sm">
                  Pausa atual: <span className="font-medium">{pauseTypeLabels[openPause.pauseType]}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Iniciada em: {format(new Date(openPause.timestampStart), "HH:mm", { locale: ptBR })}
                </p>
                <div>
                  <Label htmlFor="pauseNotesEnd">Observações da Pausa (Finalizar)</Label>
                  <Textarea
                    id="pauseNotesEnd"
                    value={pauseNotes}
                    onChange={(e) => setPauseNotes(e.target.value)}
                    placeholder="Ex: Retornando da reunião."
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleEndPause}
                  disabled={isPending}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Square className="mr-2 h-4 w-4" />}
                  Terminar Pausa
                </Button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pauseType">Tipo de Pausa</Label>
                    <Select
                      value={selectedPauseType}
                      onValueChange={(value) => setSelectedPauseType(value as PauseType)}
                    >
                      <SelectTrigger id="pauseType">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(pauseTypeLabels) as PauseType[]).map((type) => {
                          const Icon = pauseTypeIcons[type]
                          return (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center">
                                <Icon className="mr-2 h-4 w-4" />
                                {pauseTypeLabels[type]}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="pauseNotesStart">Observações da Pausa (Iniciar)</Label>
                    <Textarea
                      id="pauseNotesStart"
                      value={pauseNotes}
                      onChange={(e) => setPauseNotes(e.target.value)}
                      placeholder="Ex: Pausa para almoço, Reunião com cliente X."
                      rows={2}
                    />
                  </div>
                </div>
                <Button onClick={handleStartPause} disabled={isPending} className="w-full">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  Iniciar Pausa
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {openRecord ? (
          <Button
            onClick={handleClockOut}
            disabled={isPending || !!openPause} // Desabilitar se estiver em pausa
            className="w-full bg-red-600 hover:bg-red-700"
            title={openPause ? "Finalize a pausa atual antes de registrar a saída." : ""}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            Registrar Saída
          </Button>
        ) : (
          <Button onClick={handleClockIn} disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Registrar Entrada
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
