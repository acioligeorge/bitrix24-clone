"use server"

import { revalidatePath } from "next/cache"
import {
  clockIn as dbClockIn,
  clockOut as dbClockOut,
  getOpenTimeRecordForEmployee as dbGetOpenTimeRecordForEmployee,
  getTimeRecords as dbGetTimeRecords,
  startPause as dbStartPause, // Nova importação
  endPause as dbEndPause, // Nova importação
  getOpenPauseForTimeRecord as dbGetOpenPauseForTimeRecord, // Nova importação
  getPausesForTimeRecord as dbGetPausesForTimeRecord, // Nova importação
} from "@/app/data"
import type { TimeRecord, PauseRecord, PauseType } from "@/lib/types"

// Simulação do ID do empregado logado.
const getCurrentEmployeeId = async (): Promise<string> => {
  return "emp3" // Ana Pereira (member)
}

export interface TimeClockState {
  message: string | null
  type: "success" | "error" | null
  openRecord?: TimeRecord | null
  openPause?: PauseRecord | null // Adicionar pausa aberta ao estado
}

export async function clockInAction(notes?: string): Promise<TimeClockState> {
  const employeeId = await getCurrentEmployeeId()
  const openRecord = await dbGetOpenTimeRecordForEmployee(employeeId)

  if (openRecord) {
    const openPause = await dbGetOpenPauseForTimeRecord(openRecord.id)
    return { message: "Você já possui um ponto em aberto.", type: "error", openRecord, openPause }
  }

  try {
    const newRecord = await dbClockIn(employeeId, notes)
    revalidatePath("/configuracoes/ponto")
    return { message: "Entrada registrada com sucesso!", type: "success", openRecord: newRecord, openPause: null }
  } catch (e: any) {
    return { message: e.message || "Falha ao registrar entrada.", type: "error" }
  }
}

export async function clockOutAction(timeRecordId: string, notes?: string): Promise<TimeClockState> {
  try {
    // A verificação de pausa aberta agora é feita dentro de dbClockOut
    const updatedRecord = await dbClockOut(timeRecordId, notes)
    if (!updatedRecord) {
      return { message: "Registro de ponto não encontrado.", type: "error" }
    }
    revalidatePath("/configuracoes/ponto")
    return { message: "Saída registrada com sucesso!", type: "success", openRecord: null, openPause: null }
  } catch (e: any) {
    return { message: e.message || "Falha ao registrar saída.", type: "error" }
  }
}

export async function startPauseAction(
  timeRecordId: string,
  pauseType: PauseType,
  notes?: string,
): Promise<TimeClockState> {
  const openRecord = await dbGetOpenTimeRecordForEmployee(await getCurrentEmployeeId())
  if (!openRecord || openRecord.id !== timeRecordId) {
    return { message: "Registro de ponto principal não encontrado ou inválido.", type: "error" }
  }

  try {
    const newPause = await dbStartPause(timeRecordId, pauseType, notes)
    revalidatePath("/configuracoes/ponto")
    return { message: "Pausa iniciada com sucesso!", type: "success", openRecord, openPause: newPause }
  } catch (e: any) {
    return { message: e.message || "Falha ao iniciar pausa.", type: "error", openRecord }
  }
}

export async function endPauseAction(pauseRecordId: string, notes?: string): Promise<TimeClockState> {
  const openRecord = await dbGetOpenTimeRecordForEmployee(await getCurrentEmployeeId())
  if (!openRecord) {
    // Isso não deveria acontecer se uma pausa está sendo finalizada, mas é uma checagem de segurança
    return { message: "Nenhum registro de ponto aberto encontrado.", type: "error" }
  }
  try {
    const endedPause = await dbEndPause(pauseRecordId, notes)
    if (!endedPause) {
      return { message: "Pausa não encontrada ou já finalizada.", type: "error", openRecord }
    }
    revalidatePath("/configuracoes/ponto")
    return { message: "Pausa finalizada com sucesso!", type: "success", openRecord, openPause: null }
  } catch (e: any) {
    return { message: e.message || "Falha ao finalizar pausa.", type: "error", openRecord }
  }
}

export async function getMyOpenTimeRecordAndPauseAction(): Promise<{
  record: TimeRecord | null
  pause: PauseRecord | null
}> {
  const employeeId = await getCurrentEmployeeId()
  const record = await dbGetOpenTimeRecordForEmployee(employeeId)
  if (record) {
    const pause = await dbGetOpenPauseForTimeRecord(record.id)
    return { record, pause }
  }
  return { record: null, pause: null }
}

export async function getMyTimeRecordsAction(filters: {
  startDate?: string
  endDate?: string
}): Promise<TimeRecord[]> {
  const employeeId = await getCurrentEmployeeId()
  return dbGetTimeRecords({ ...filters, employeeId })
}

export async function getAllTimeRecordsAction(filters: {
  employeeId?: string
  startDate?: string
  endDate?: string
}): Promise<TimeRecord[]> {
  return dbGetTimeRecords(filters)
}

// Action para buscar pausas de um TimeRecord específico (para a lista)
export async function getPausesForRecordAction(timeRecordId: string): Promise<PauseRecord[]> {
  return dbGetPausesForTimeRecord(timeRecordId)
}
