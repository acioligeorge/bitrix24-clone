"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link" // Adicionar import
import { useState, useEffect } from "react"
import { TimeClockControls } from "@/components/time-clock-controls"
import { TimeRecordList } from "@/components/time-record-list"
import { getMyTimeRecordsAction, getAllTimeRecordsAction, getPausesForRecordAction } from "./actions"
import { getEmployees, getEmployeeById } from "@/app/data"
import type { TimeRecord, Employee, PauseRecord } from "@/lib/types"
import { Clock, Users, Filter, Loader2, ArrowLeft } from "lucide-react" // Adicionar ArrowLeft
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DateRange } from "react-day-picker"
import { addDays, format as formatDateFns } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TableHead, TableHeader, TableRow, Table } from "@/components/ui/table" // Para o cabeçalho da lista

const LOGGED_IN_EMPLOYEE_ID = "emp3"

export default function SistemaPontoPage() {
  const [myRecords, setMyRecords] = useState<TimeRecord[]>([])
  const [allRecords, setAllRecords] = useState<TimeRecord[]>([])
  const [pausesByRecordId, setPausesByRecordId] = useState<Record<string, PauseRecord[]>>({})
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentUser, setCurrentUser] = useState<Employee | null>(null)
  const [isLoadingMyRecords, setIsLoadingMyRecords] = useState(true)
  const [isLoadingAllRecords, setIsLoadingAllRecords] = useState(false)

  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })

  const fetchPausesForRecords = async (records: TimeRecord[]) => {
    const pausesMap: Record<string, PauseRecord[]> = {}
    for (const record of records) {
      pausesMap[record.id] = await getPausesForRecordAction(record.id)
    }
    return pausesMap
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoadingMyRecords(true)
      const user = await getEmployeeById(LOGGED_IN_EMPLOYEE_ID)
      setCurrentUser(user || null)

      const records = await getMyTimeRecordsAction({})
      setMyRecords(records)
      const myPauses = await fetchPausesForRecords(records)
      setPausesByRecordId((prev) => ({ ...prev, ...myPauses }))
      setIsLoadingMyRecords(false)

      if (user && (user.role === "admin" || user.role === "manager")) {
        const fetchedEmployees = await getEmployees()
        setEmployees(fetchedEmployees)
        await fetchAllFilteredRecords(fetchedEmployees) // Passar employees para evitar race condition
      }
    }
    fetchData()
  }, [])

  const fetchAllFilteredRecords = async (currentEmployees?: Employee[]) => {
    const effectiveEmployees = currentEmployees || employees
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "manager")) return
    setIsLoadingAllRecords(true)
    const filters: { employeeId?: string; startDate?: string; endDate?: string } = {}
    if (selectedEmployeeFilter !== "all") {
      filters.employeeId = selectedEmployeeFilter
    }
    if (dateRangeFilter?.from) {
      filters.startDate = formatDateFns(dateRangeFilter.from, "yyyy-MM-dd")
    }
    if (dateRangeFilter?.to) {
      filters.endDate = formatDateFns(dateRangeFilter.to, "yyyy-MM-dd")
    }
    const records = await getAllTimeRecordsAction(filters)
    setAllRecords(records)
    const allPauses = await fetchPausesForRecords(records)
    setPausesByRecordId((prev) => ({ ...prev, ...allPauses }))
    setIsLoadingAllRecords(false)
  }

  const DatePickerPlaceholder = ({
    date,
    onDateChange,
  }: { date?: DateRange; onDateChange: (range?: DateRange) => void }) => (
    <div className="flex gap-2 items-center">
      <Input
        type="date"
        value={date?.from ? formatDateFns(date.from, "yyyy-MM-dd") : ""}
        onChange={(e) =>
          onDateChange({ ...date, from: e.target.value ? new Date(e.target.value + "T00:00:00") : undefined })
        }
        className="w-full"
      />
      <span>até</span>
      <Input
        type="date"
        value={date?.to ? formatDateFns(date.to, "yyyy-MM-dd") : ""}
        onChange={(e) =>
          onDateChange({ ...date, to: e.target.value ? new Date(e.target.value + "T23:59:59") : undefined })
        }
        className="w-full"
      />
    </div>
  )

  const renderRecordListHeader = (showEmployee: boolean) => (
    <Table className="mb-0">
      <colgroup>
        {showEmployee && <col style={{ width: "20%" }} />}
        <col style={{ width: "15%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "15%" }} />
        <col style={{ width: "30%" }} />
      </colgroup>
      <TableHeader>
        <TableRow>
          {showEmployee && <TableHead>Empregado</TableHead>}
          <TableHead>Data</TableHead>
          <TableHead>Entrada</TableHead>
          <TableHead>Saída</TableHead>
          <TableHead>Duração Efetiva</TableHead>
          <TableHead className="hidden md:table-cell">Observações</TableHead>
        </TableRow>
      </TableHeader>
    </Table>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/configuracoes" passHref>
          <Button variant="outline" size="icon" aria-label="Voltar para Configurações">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Clock className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Ponto</h1>
        </div>
      </div>

      <TimeClockControls />

      <Card>
        <CardHeader>
          <CardTitle>Meus Registros Recentes</CardTitle>
          <CardDescription>Visualize seus últimos registros de ponto e pausas.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMyRecords ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {renderRecordListHeader(false)}
              <TimeRecordList records={myRecords} employees={employees} pausesByRecordId={pausesByRecordId} />
            </>
          )}
        </CardContent>
      </Card>

      {currentUser && (currentUser.role === "admin" || currentUser.role === "manager") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Registros de Ponto da Equipe
            </CardTitle>
            <CardDescription>Filtre e visualize os registros de ponto de todos os empregados.</CardDescription>
            <div className="mt-4 flex flex-col md:flex-row gap-4 items-end">
              <div className="grid gap-1.5 w-full md:w-auto">
                <Label htmlFor="employee-filter">Filtrar por Empregado</Label>
                <Select value={selectedEmployeeFilter} onValueChange={setSelectedEmployeeFilter}>
                  <SelectTrigger id="employee-filter" className="w-full md:w-[200px]">
                    <SelectValue placeholder="Selecione empregado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Empregados</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5 w-full md:w-auto">
                <Label>Filtrar por Período</Label>
                <DatePickerPlaceholder date={dateRangeFilter} onDateChange={setDateRangeFilter} />
              </div>
              <Button onClick={() => fetchAllFilteredRecords()} disabled={isLoadingAllRecords}>
                {isLoadingAllRecords ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Filter className="mr-2 h-4 w-4" />
                )}
                Aplicar Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingAllRecords ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {renderRecordListHeader(true)}
                <TimeRecordList
                  records={allRecords}
                  employees={employees}
                  pausesByRecordId={pausesByRecordId}
                  showEmployeeColumn
                />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
