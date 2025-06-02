// Simulação de um banco de dados em memória
import type {
  AppData,
  Client,
  Employee,
  ChatMessage,
  TimeRecord,
  PauseRecord, // Importar PauseRecord
  PauseType, // Importar PauseType
  Permission,
  RolePermission,
  PermissionId,
  Project,
  Task,
  UserChatStatus, // Importar UserChatStatus
} from "@/lib/types"
import { format } from "date-fns"

const initialPermissions: Permission[] = [
  { id: "view_clients", name: "Visualizar Clientes", description: "Permite visualizar clientes.", module: "Clientes" },
  { id: "edit_clients", name: "Editar Clientes", description: "Permite criar e editar clientes.", module: "Clientes" },
  { id: "delete_clients", name: "Excluir Clientes", description: "Permite excluir clientes.", module: "Clientes" },
  { id: "view_projects", name: "Visualizar Projetos", description: "Permite visualizar projetos.", module: "Projetos" },
  { id: "edit_projects", name: "Editar Projetos", description: "Permite criar e editar projetos.", module: "Projetos" },
  { id: "delete_projects", name: "Excluir Projetos", description: "Permite excluir projetos.", module: "Projetos" },
  { id: "assign_projects", name: "Atribuir Projetos", description: "Permite atribuir projetos.", module: "Projetos" },
  { id: "view_tasks", name: "Visualizar Tarefas", description: "Permite visualizar tarefas.", module: "Tarefas" },
  { id: "edit_tasks", name: "Editar Tarefas", description: "Permite criar e editar tarefas.", module: "Tarefas" },
  { id: "delete_tasks", name: "Excluir Tarefas", description: "Permite excluir tarefas.", module: "Tarefas" },
  { id: "assign_tasks", name: "Atribuir Tarefas", description: "Permite atribuir tarefas.", module: "Tarefas" },
  {
    id: "manage_employees",
    name: "Gerenciar Empregados",
    description: "Permite gerenciar empregados.",
    module: "Configurações",
  },
  {
    id: "view_time_records_all",
    name: "Ver Ponto (Todos)",
    description: "Permite ver ponto de todos.",
    module: "Sistema de Ponto",
  },
  {
    id: "edit_time_records",
    name: "Editar Ponto",
    description: "Permite editar registros de ponto.",
    module: "Sistema de Ponto",
  },
  {
    id: "manage_roles_permissions",
    name: "Gerenciar Permissões",
    description: "Permite gerenciar permissões.",
    module: "Configurações",
  },
]

const initialRolePermissions: RolePermission[] = [
  ...initialPermissions.map((p) => ({ role: "admin" as Employee["role"], permissionId: p.id })),
  { role: "manager", permissionId: "view_clients" },
  { role: "manager", permissionId: "edit_clients" },
  { role: "manager", permissionId: "view_projects" },
  { role: "manager", permissionId: "edit_projects" },
  { role: "manager", permissionId: "delete_projects" },
  { role: "manager", permissionId: "assign_projects" },
  { role: "manager", permissionId: "view_tasks" },
  { role: "manager", permissionId: "edit_tasks" },
  { role: "manager", permissionId: "delete_tasks" },
  { role: "manager", permissionId: "assign_tasks" },
  { role: "manager", permissionId: "manage_employees" },
  { role: "manager", permissionId: "view_time_records_all" },
  { role: "member", permissionId: "view_clients" },
  { role: "member", permissionId: "view_projects" },
  { role: "member", permissionId: "view_tasks" },
  { role: "member", permissionId: "edit_tasks" },
]

const data: AppData = {
  clients: [
    {
      id: "1",
      name: "Empresa Alpha Lda.", // Nome/Razão Social
      email: "contato@alpha.com",
      phone: "11999990001",
      company: "Alpha Soluções", // Nome Fantasia
      createdAt: new Date("2023-01-15T10:00:00Z"),
      updatedAt: new Date("2023-01-15T10:00:00Z"),
      clientNumber: "C001",
      nif: "123456789",
      clientType: "empresa",
      responsibleName: "João Silva",
    },
    {
      id: "2",
      name: "Beta Serviços Unipessoal Lda.",
      email: "comercial@beta.com",
      phone: "21988880002",
      company: "Beta Consultoria",
      createdAt: new Date("2023-02-20T14:30:00Z"),
      updatedAt: new Date("2023-02-20T14:30:00Z"),
      clientNumber: "C002",
      nif: "987654321",
      clientType: "empresa",
      responsibleName: "Maria Oliveira",
    },
    {
      id: "3",
      name: "Joana Arruda", // Pessoa Singular
      email: "joana.arruda@emailpessoal.com",
      phone: "31977770003",
      // company: undefined, // Não se aplica a pessoa singular
      createdAt: new Date("2023-03-10T09:00:00Z"),
      updatedAt: new Date("2023-03-10T09:00:00Z"),
      clientNumber: "P001", // Diferente prefixo para pessoa singular
      nif: "112233445", // NIF pessoal
      clientType: "pessoa_singular",
      // responsibleName: undefined, // Não se aplica a pessoa singular
    },
  ],
  employees: [
    {
      id: "emp1",
      name: "Admin Acioli",
      email: "admin@aciolicrm.com",
      role: "admin",
      department: "Administração",
      position: "CEO",
      isActive: true,
      avatarUrl: "/placeholder.svg?height=40&width=40",
      chatStatus: "available",
      createdAt: new Date("2023-01-01T09:00:00Z"),
      updatedAt: new Date("2023-01-01T09:00:00Z"),
    },
    {
      id: "emp2",
      name: "Carlos Silva",
      email: "carlos.silva@aciolicrm.com",
      role: "manager",
      department: "Vendas",
      position: "Gerente de Vendas",
      isActive: true,
      avatarUrl: "/placeholder.svg?height=40&width=40",
      chatStatus: "busy",
      createdAt: new Date("2023-01-10T09:00:00Z"),
      updatedAt: new Date("2023-05-10T11:00:00Z"),
    },
    {
      id: "emp3",
      name: "Ana Pereira",
      email: "ana.pereira@aciolicrm.com",
      role: "member",
      department: "Suporte",
      position: "Analista de Suporte",
      isActive: true,
      avatarUrl: "/placeholder.svg?height=40&width=40",
      chatStatus: "available",
      createdAt: new Date("2023-02-01T09:00:00Z"),
      updatedAt: new Date("2023-04-01T17:00:00Z"),
    },
    {
      id: "emp4",
      name: "Bruno Lima",
      email: "bruno.lima@aciolicrm.com",
      role: "member",
      department: "Desenvolvimento",
      position: "Desenvolvedor Pleno",
      isActive: true,
      avatarUrl: "/placeholder.svg?height=40&width=40",
      chatStatus: "in-meeting",
      createdAt: new Date("2023-03-15T09:00:00Z"),
      updatedAt: new Date("2023-06-01T17:00:00Z"),
    },
  ],
  projects: [
    {
      id: "proj1",
      name: "Desenvolvimento Novo Website",
      description: "Criar o novo website institucional da Empresa Alpha.",
      clientId: "1",
      status: "in-progress",
      dueDate: new Date("2025-08-30T00:00:00Z"),
      createdAt: new Date("2025-05-01T00:00:00Z"),
      updatedAt: new Date("2025-05-15T00:00:00Z"),
    },
    {
      id: "proj2",
      name: "Consultoria SEO",
      description: "Serviço de consultoria SEO para Beta Serviços.",
      clientId: "2",
      status: "completed",
      dueDate: new Date("2025-04-15T00:00:00Z"),
      createdAt: new Date("2025-02-01T00:00:00Z"),
      updatedAt: new Date("2025-04-15T00:00:00Z"),
    },
    {
      id: "proj3",
      name: "Website Pessoal Joana Arruda",
      description: "Desenvolvimento de um website pessoal para Joana Arruda.",
      clientId: "3", // Associado à pessoa singular
      status: "not-started",
      dueDate: null,
      createdAt: new Date("2025-06-01T00:00:00Z"),
      updatedAt: new Date("2025-06-01T00:00:00Z"),
    },
  ],
  tasks: [
    {
      id: "task1",
      title: "Definir Arquitetura do Website",
      description: "Planejar a arquitetura de informação e tecnologias.",
      projectId: "proj1",
      assigneeId: "emp4",
      status: "in-progress",
      priority: "high",
      dueDate: new Date("2025-06-15T00:00:00Z"),
      createdAt: new Date("2025-05-10T00:00:00Z"),
      updatedAt: new Date("2025-05-20T00:00:00Z"),
    },
    {
      id: "task2",
      title: "Criar Layout Homepage",
      projectId: "proj1",
      assigneeId: "emp3",
      status: "todo",
      priority: "high",
      dueDate: new Date("2025-06-30T00:00:00Z"),
      createdAt: new Date("2025-05-15T00:00:00Z"),
      updatedAt: new Date("2025-05-15T00:00:00Z"),
    },
    {
      id: "task3",
      title: "Relatório Final SEO",
      description: "Entregar o relatório final da consultoria.",
      projectId: "proj2",
      assigneeId: "emp2",
      status: "done",
      priority: "medium",
      dueDate: new Date("2025-04-14T00:00:00Z"),
      createdAt: new Date("2025-04-01T00:00:00Z"),
      updatedAt: new Date("2025-04-14T00:00:00Z"),
    },
    {
      id: "task4",
      title: "Levantamento de Requisitos Website Pessoal",
      projectId: "proj3",
      assigneeId: null,
      status: "backlog",
      priority: "medium",
      dueDate: null,
      createdAt: new Date("2025-06-02T00:00:00Z"),
      updatedAt: new Date("2025-06-02T00:00:00Z"),
    },
  ],
  chatMessages: [
    {
      id: "msg1",
      senderId: "emp2",
      receiverId: "emp1",
      content: "Olá Admin, o relatório de vendas está pronto.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: "text",
    },
    {
      id: "msg2",
      senderId: "emp1",
      receiverId: "emp2",
      content: "Obrigado Carlos! Vou revisar.",
      timestamp: new Date(Date.now() - 1000 * 60 * 58),
      type: "text",
    },
  ],
  timeRecords: [
    {
      id: "tr1",
      employeeId: "emp2",
      timestampIn: new Date(new Date().setHours(9, 0, 0, 0)),
      timestampOut: new Date(new Date().setHours(18, 5, 0, 0)),
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "Dia produtivo",
    },
    {
      id: "tr2",
      employeeId: "emp3",
      timestampIn: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(8, 30, 0, 0)),
      timestampOut: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(17, 45, 0, 0)),
      date: format(new Date(new Date().setDate(new Date().getDate() - 1)), "yyyy-MM-dd"),
    },
    {
      id: "tr3",
      employeeId: "emp2",
      timestampIn: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(9, 15, 0, 0)),
      timestampOut: null, // Ponto em aberto
      date: format(new Date(new Date().setDate(new Date().getDate() - 1)), "yyyy-MM-dd"),
      notes: "Ponto esquecido",
    },
  ],
  pauseRecords: [],
  permissions: initialPermissions,
  rolePermissions: initialRolePermissions,
}

// Funções CRUD para Clientes
export async function getClients(): Promise<Client[]> {
  return [...data.clients]
}
export async function getClientById(id: string): Promise<Client | undefined> {
  return data.clients.find((client) => client.id === id)
}
export async function createClient(clientData: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
  const newClient: Client = {
    ...clientData,
    id: String(Date.now()) + Math.random().toString(36).substring(2, 7),
    createdAt: new Date(),
    updatedAt: new Date(),
    responsibleName: clientData.clientType === "empresa" ? clientData.responsibleName : undefined,
  }
  data.clients.push(newClient)
  return newClient
}
export async function updateClient(
  id: string,
  clientUpdateData: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>,
): Promise<Client | null> {
  const clientIndex = data.clients.findIndex((client) => client.id === id)
  if (clientIndex === -1) return null

  const updatedClientData = { ...clientUpdateData }
  if (updatedClientData.clientType !== "empresa") {
    updatedClientData.responsibleName = undefined
  }

  const updatedClient = { ...data.clients[clientIndex], ...updatedClientData, updatedAt: new Date() }
  data.clients[clientIndex] = updatedClient
  return updatedClient
}
export async function deleteClient(id: string): Promise<boolean> {
  const initialLength = data.clients.length
  data.clients = data.clients.filter((client) => client.id !== id)
  return data.clients.length < initialLength
}

// Funções CRUD para Empregados (existentes)
export async function getEmployees(): Promise<Employee[]> {
  return [...data.employees]
}
export async function getEmployeeById(id: string): Promise<Employee | undefined> {
  return data.employees.find((employee) => employee.id === id)
}
export async function createEmployee(
  employeeData: Omit<Employee, "id" | "createdAt" | "updatedAt" | "isActive" | "chatStatus">,
): Promise<Employee> {
  const newEmployee: Employee = {
    ...employeeData,
    id: "emp" + String(Date.now()) + Math.random().toString(36).substring(2, 7),
    isActive: true,
    chatStatus: "available", // Default status
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  data.employees.push(newEmployee)
  return newEmployee
}
export async function updateEmployee(
  id: string,
  employeeUpdateData: Partial<Omit<Employee, "id" | "createdAt" | "updatedAt">>,
): Promise<Employee | null> {
  const employeeIndex = data.employees.findIndex((emp) => emp.id === id)
  if (employeeIndex === -1) {
    return null
  }
  const updatedEmployee = { ...data.employees[employeeIndex], ...employeeUpdateData, updatedAt: new Date() }
  data.employees[employeeIndex] = updatedEmployee
  return updatedEmployee
}
export async function deleteEmployee(id: string): Promise<boolean> {
  const initialLength = data.employees.length
  data.employees = data.employees.filter((employee) => employee.id !== id)
  return data.employees.length < initialLength
}

// Nova função para atualizar o status do chat do empregado
export async function updateEmployeeChatStatus(
  employeeId: string,
  chatStatus: UserChatStatus,
): Promise<Employee | null> {
  const employeeIndex = data.employees.findIndex((emp) => emp.id === employeeId)
  if (employeeIndex === -1) {
    return null
  }
  data.employees[employeeIndex].chatStatus = chatStatus
  data.employees[employeeIndex].updatedAt = new Date()
  return data.employees[employeeIndex]
}

// Funções para Chat (existentes)
export async function getChatMessages(channelOrUserId: string, isChannel: boolean): Promise<ChatMessage[]> {
  if (isChannel) {
    return data.chatMessages
      .filter((msg) => msg.channelId === channelOrUserId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }
  const currentUserId = "emp1" // Simulação, idealmente viria da sessão
  return data.chatMessages
    .filter(
      (msg) =>
        (msg.senderId === currentUserId && msg.receiverId === channelOrUserId) ||
        (msg.senderId === channelOrUserId && msg.receiverId === currentUserId),
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}
export async function sendChatMessage(messageData: Omit<ChatMessage, "id" | "timestamp">): Promise<ChatMessage> {
  const newMessage: ChatMessage = {
    ...messageData,
    id: "msg" + String(Date.now()) + Math.random().toString(36).substring(2, 7),
    timestamp: new Date(),
  }
  data.chatMessages.push(newMessage)
  return newMessage
}

// Funções para Sistema de Ponto
export async function clockIn(employeeId: string, notes?: string): Promise<TimeRecord> {
  const now = new Date()
  const newRecord: TimeRecord = {
    id: "tr" + String(Date.now()) + Math.random().toString(36).substring(2, 7),
    employeeId,
    timestampIn: now,
    date: format(now, "yyyy-MM-dd"),
    notes,
  }
  data.timeRecords.push(newRecord)
  return newRecord
}

export async function clockOut(timeRecordId: string, notes?: string): Promise<TimeRecord | null> {
  const recordIndex = data.timeRecords.findIndex((tr) => tr.id === timeRecordId)
  if (recordIndex === -1) return null

  const openPause = data.pauseRecords.find((pr) => pr.timeRecordId === timeRecordId && !pr.timestampEnd)
  if (openPause) {
    throw new Error("Não é possível registrar saída. Existe uma pausa em aberto.")
  }

  data.timeRecords[recordIndex].timestampOut = new Date()
  if (notes) {
    const currentNotes = data.timeRecords[recordIndex].notes || ""
    data.timeRecords[recordIndex].notes = currentNotes ? `${currentNotes} (Saída: ${notes})` : `Saída: ${notes}`
  }
  return data.timeRecords[recordIndex]
}

export async function getOpenTimeRecordForEmployee(employeeId: string): Promise<TimeRecord | undefined> {
  return data.timeRecords.find((tr) => tr.employeeId === employeeId && !tr.timestampOut)
}

export async function getTimeRecords(filters: { employeeId?: string; startDate?: string; endDate?: string }): Promise<
  TimeRecord[]
> {
  let records = [...data.timeRecords]
  if (filters.employeeId) {
    records = records.filter((tr) => tr.employeeId === filters.employeeId)
  }
  if (filters.startDate) {
    records = records.filter((tr) => tr.date >= filters.startDate!)
  }
  if (filters.endDate) {
    records = records.filter((tr) => tr.date <= filters.endDate!)
  }
  return records.sort((a, b) => b.timestampIn.getTime() - a.timestampIn.getTime())
}

// Novas funções para Pausas
export async function startPause(
  timeRecordId: string,
  pauseType: PauseType,
  notesStart?: string,
): Promise<PauseRecord> {
  const timeRecord = data.timeRecords.find((tr) => tr.id === timeRecordId)
  if (!timeRecord || timeRecord.timestampOut) {
    throw new Error("Registro de ponto não encontrado ou já finalizado.")
  }
  const existingOpenPause = data.pauseRecords.find((pr) => pr.timeRecordId === timeRecordId && !pr.timestampEnd)
  if (existingOpenPause) {
    throw new Error("Já existe uma pausa em aberto para este registro de ponto.")
  }

  const newPause: PauseRecord = {
    id: "pr" + String(Date.now()) + Math.random().toString(36).substring(2, 7),
    timeRecordId,
    pauseType,
    timestampStart: new Date(),
    notesStart,
  }
  data.pauseRecords.push(newPause)
  return newPause
}

export async function endPause(pauseRecordId: string, notesEnd?: string): Promise<PauseRecord | null> {
  const pauseIndex = data.pauseRecords.findIndex((pr) => pr.id === pauseRecordId)
  if (pauseIndex === -1 || data.pauseRecords[pauseIndex].timestampEnd) {
    return null
  }
  data.pauseRecords[pauseIndex].timestampEnd = new Date()
  if (notesEnd) {
    data.pauseRecords[pauseIndex].notesEnd = notesEnd
  }
  return data.pauseRecords[pauseIndex]
}

export async function getOpenPauseForTimeRecord(timeRecordId: string): Promise<PauseRecord | undefined> {
  return data.pauseRecords.find((pr) => pr.timeRecordId === timeRecordId && !pr.timestampEnd)
}

export async function getPausesForTimeRecord(timeRecordId: string): Promise<PauseRecord[]> {
  return data.pauseRecords
    .filter((pr) => pr.timeRecordId === timeRecordId)
    .sort((a, b) => a.timestampStart.getTime() - b.timestampStart.getTime())
}

// Funções para Níveis de Acesso (existentes)
export async function getAllPermissions(): Promise<Permission[]> {
  return [...data.permissions]
}
export async function getPermissionsForRole(role: Employee["role"]): Promise<PermissionId[]> {
  return data.rolePermissions.filter((rp) => rp.role === role).map((rp) => rp.permissionId)
}
export async function updatePermissionsForRole(
  role: Employee["role"],
  permissionIds: PermissionId[],
): Promise<boolean> {
  data.rolePermissions = data.rolePermissions.filter((rp) => rp.role !== role)
  permissionIds.forEach((permissionId) => {
    data.rolePermissions.push({ role, permissionId })
  })
  return true
}

// Funções CRUD para Projetos (existentes)
export async function getProjects(): Promise<Project[]> {
  return [...data.projects]
}
export async function getProjectById(id: string): Promise<Project | undefined> {
  return data.projects.find((project) => project.id === id)
}
export async function createProject(projectData: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
  const newProject: Project = {
    ...projectData,
    id: "proj" + String(Date.now()) + Math.random().toString(36).substring(2, 7),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  data.projects.push(newProject)
  return newProject
}
export async function updateProject(
  id: string,
  projectUpdateData: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>,
): Promise<Project | null> {
  const projectIndex = data.projects.findIndex((project) => project.id === id)
  if (projectIndex === -1) return null
  const updatedProject = { ...data.projects[projectIndex], ...projectUpdateData, updatedAt: new Date() }
  data.projects[projectIndex] = updatedProject
  return updatedProject
}
export async function deleteProject(id: string): Promise<boolean> {
  const initialLength = data.projects.length
  data.projects = data.projects.filter((project) => project.id !== id)
  data.tasks = data.tasks.filter((task) => task.projectId !== id)
  return data.projects.length < initialLength
}

// Funções CRUD para Tarefas (existentes)
export async function getTasks(filters?: { projectId?: string; assigneeId?: string }): Promise<Task[]> {
  let tasks = [...data.tasks]
  if (filters?.projectId) {
    tasks = tasks.filter((task) => task.projectId === filters.projectId)
  }
  if (filters?.assigneeId) {
    tasks = tasks.filter((task) => task.assigneeId === filters.assigneeId)
  }
  return tasks
}
export async function getTaskById(id: string): Promise<Task | undefined> {
  return data.tasks.find((task) => task.id === id)
}
export async function createTask(taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
  const newTask: Task = {
    ...taskData,
    id: "task" + String(Date.now()) + Math.random().toString(36).substring(2, 7),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  data.tasks.push(newTask)
  return newTask
}
export async function updateTask(
  id: string,
  taskUpdateData: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>,
): Promise<Task | null> {
  const taskIndex = data.tasks.findIndex((task) => task.id === id)
  if (taskIndex === -1) return null
  const updatedTask = { ...data.tasks[taskIndex], ...taskUpdateData, updatedAt: new Date() }
  data.tasks[taskIndex] = updatedTask
  return updatedTask
}
export async function deleteTask(id: string): Promise<boolean> {
  const initialLength = data.tasks.length
  data.tasks = data.tasks.filter((task) => task.id !== id)
  return data.tasks.length < initialLength
}
