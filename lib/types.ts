export interface Client {
  id: string
  name: string // Pode ser Nome Completo (Pessoa Singular) ou Razão Social (Empresa)
  email: string
  phone?: string
  company?: string // Pode ser usado para Nome Fantasia se Tipo Cliente for Empresa
  createdAt: Date
  updatedAt: Date
  clientNumber: string
  nif?: string // Número de Identificação Fiscal
  clientType?: "empresa" | "pessoa_singular" // Alterado
  responsibleName?: string // Nome do contato principal ou responsável (se empresa)
}

export interface Project {
  id: string
  name: string
  description?: string
  clientId?: string | null
  status: "not-started" | "in-progress" | "completed" | "on-hold" | "cancelled"
  dueDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  projectId: string
  assigneeId?: string | null
  status: "todo" | "in-progress" | "review" | "done" | "backlog"
  priority: "low" | "medium" | "high" | "urgent"
  dueDate?: Date | null
  createdAt: Date
  updatedAt: Date
}

export type UserChatStatus = "available" | "busy" | "in-meeting" | "invisible"

export interface Employee {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "member"
  department?: string
  position?: string
  isActive: boolean
  avatarUrl?: string
  chatStatus?: UserChatStatus // Novo campo para status do chat
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  senderId: string
  receiverId?: string
  channelId?: string
  content: string
  timestamp: Date
  type: "text" | "image" | "file"
}

export type PauseType = "break" | "reunion" | "alignment"

export const pauseTypeLabels: Record<PauseType, string> = {
  break: "Intervalo/Descanso",
  reunion: "Reunião",
  alignment: "Alinhamento",
}

export interface PauseRecord {
  id: string
  timeRecordId: string
  pauseType: PauseType
  timestampStart: Date
  timestampEnd?: Date | null
  notesStart?: string
  notesEnd?: string
}

export interface TimeRecord {
  id: string
  employeeId: string
  timestampIn: Date
  timestampOut?: Date | null
  date: string
  notes?: string
}

export type PermissionId =
  | "view_clients"
  | "edit_clients"
  | "delete_clients"
  | "view_projects"
  | "edit_projects"
  | "delete_projects"
  | "assign_projects"
  | "view_tasks"
  | "edit_tasks"
  | "delete_tasks"
  | "assign_tasks"
  | "manage_employees"
  | "view_time_records_all"
  | "edit_time_records"
  | "manage_roles_permissions"
  | "access_settings_billing"

export interface Permission {
  id: PermissionId
  name: string
  description: string
  module: string
}

export interface RolePermission {
  role: Employee["role"]
  permissionId: PermissionId
}

export interface AppData {
  clients: Client[]
  projects: Project[]
  tasks: Task[]
  employees: Employee[]
  chatMessages: ChatMessage[]
  timeRecords: TimeRecord[]
  pauseRecords: PauseRecord[]
  permissions: Permission[]
  rolePermissions: RolePermission[]
}
