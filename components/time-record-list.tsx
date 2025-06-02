"use client"

import type { TimeRecord, Employee, PauseRecord } from "@/lib/types"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { format, formatDuration, intervalToDuration, differenceInMilliseconds } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { pauseTypeLabels } from "@/lib/types"
import { Clock3 } from "lucide-react"

interface TimeRecordListProps {
  records: TimeRecord[]
  employees: Employee[]
  pausesByRecordId: Record<string, PauseRecord[]> // Pausas agrupadas pelo ID do TimeRecord
  showEmployeeColumn?: boolean
}

export function TimeRecordList({
  records,
  employees,
  pausesByRecordId,
  showEmployeeColumn = false,
}: TimeRecordListProps) {
  if (!records || records.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum registro de ponto encontrado.</p>
  }

  const getEmployeeName = (employeeId: string) => {
    return employees.find((emp) => emp.id === employeeId)?.name || "Desconhecido"
  }

  const calculateDurationWithPauses = (record: TimeRecord, pauses: PauseRecord[] = []) => {
    if (!record.timestampOut) return "Em aberto"

    const totalDurationMs = differenceInMilliseconds(new Date(record.timestampOut), new Date(record.timestampIn))
    let totalPauseMs = 0

    pauses.forEach((pause) => {
      if (pause.timestampEnd) {
        totalPauseMs += differenceInMilliseconds(new Date(pause.timestampEnd), new Date(pause.timestampStart))
      }
    })

    const netDurationMs = Math.max(0, totalDurationMs - totalPauseMs)
    const duration = intervalToDuration({ start: 0, end: netDurationMs })

    return formatDuration(duration, { locale: ptBR, format: ["hours", "minutes"] }) || "0 min"
  }

  return (
    <Accordion type="multiple" className="w-full">
      {records.map((record) => {
        const recordPauses = pausesByRecordId[record.id] || []
        return (
          <AccordionItem value={record.id} key={record.id}>
            <AccordionTrigger className="hover:no-underline p-0 w-full">
              <Table className="w-full">
                <colgroup>
                  {showEmployeeColumn && <col style={{ width: "20%" }} />}
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "30%" }} />
                </colgroup>
                {/* Renderizar TableHeader apenas uma vez, fora do map, ou condicionalmente */}
                {/* Para simplificar, vamos omitir o header repetido aqui e confiar no header principal da página */}
                <TableBody>
                  <TableRow className="border-b-0">
                    {showEmployeeColumn && (
                      <TableCell className="font-medium py-3">{getEmployeeName(record.employeeId)}</TableCell>
                    )}
                    <TableCell className="py-3">
                      {format(new Date(record.timestampIn), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="py-3">
                      {format(new Date(record.timestampIn), "HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="py-3">
                      {record.timestampOut ? (
                        format(new Date(record.timestampOut), "HH:mm", { locale: ptBR })
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-600">
                          Em aberto
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3 font-semibold">
                      {calculateDurationWithPauses(record, recordPauses)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-xs py-3">
                      {record.notes || "-"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionTrigger>
            <AccordionContent>
              {recordPauses.length > 0 ? (
                <div className="pl-4 pr-2 py-2 bg-muted/30 rounded-b-md">
                  <h4 className="text-xs font-semibold mb-1 text-muted-foreground flex items-center">
                    <Clock3 className="w-3 h-3 mr-1.5" />
                    Detalhes das Pausas:
                  </h4>
                  <ul className="space-y-1 text-xs">
                    {recordPauses.map((pause) => (
                      <li key={pause.id} className="flex justify-between items-center p-1.5 rounded bg-background/50">
                        <div>
                          <span className="font-medium">{pauseTypeLabels[pause.pauseType]}</span>:{" "}
                          {format(new Date(pause.timestampStart), "HH:mm", { locale: ptBR })} -{" "}
                          {pause.timestampEnd
                            ? format(new Date(pause.timestampEnd), "HH:mm", { locale: ptBR })
                            : "Em aberto"}
                          {pause.notesStart && (
                            <span className="text-muted-foreground italic ml-1 text-[11px]">
                              (Início: {pause.notesStart})
                            </span>
                          )}
                          {pause.notesEnd && (
                            <span className="text-muted-foreground italic ml-1 text-[11px]">
                              (Fim: {pause.notesEnd})
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {pause.timestampEnd
                            ? formatDuration(
                                intervalToDuration({
                                  start: new Date(pause.timestampStart),
                                  end: new Date(pause.timestampEnd),
                                }),
                                { locale: ptBR, format: ["hours", "minutes"] },
                              ) || "0 min"
                            : "Em curso"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground px-4 py-2 bg-muted/30 rounded-b-md">
                  Nenhuma pausa registrada para este período.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
