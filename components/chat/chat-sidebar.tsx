"use client"

import type { Employee } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ChatStatusSelector } from "./chat-status-selector" // Importar o novo componente
import type { UserChatStatus } from "@/lib/types" // Importar UserChatStatus

interface ChatSidebarProps {
  users: Employee[]
  channels: { id: string; name: string; unread?: number }[]
  selectedChatId: string | null
  onSelectChat: (id: string, type: "user" | "channel") => void
  currentUser: Employee | null // Adicionar currentUser
  onUserStatusChange: (newStatus: UserChatStatus) => void // Adicionar callback
}

export function ChatSidebar({
  users,
  channels,
  selectedChatId,
  onSelectChat,
  currentUser,
  onUserStatusChange,
}: ChatSidebarProps) {
  const canSetStatus = currentUser && (currentUser.role === "admin" || currentUser.role === "manager")

  return (
    <div className="w-full md:w-80 border-r bg-background flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-primary">Conversas</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">Canais</h3>
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onSelectChat(channel.id, "channel")}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-md hover:bg-muted text-left",
                selectedChatId === channel.id && "bg-primary/10 text-primary",
              )}
            >
              <span className="font-medium"># {channel.name}</span>
              {channel.unread && channel.unread > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {channel.unread}
                </Badge>
              )}
            </button>
          ))}
        </div>
        <div className="p-2">
          <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">Mensagens Diretas</h3>
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectChat(user.id, "user")}
              className={cn(
                "w-full flex items-center p-2 rounded-md hover:bg-muted",
                selectedChatId === user.id && "bg-primary/10 text-primary",
              )}
            >
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user.avatarUrl || `/placeholder.svg?height=32&width=32&query=avatar+${user.name}`} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <span className="font-medium">{user.name}</span>
                {/* Indicador de status do usuário (visual) */}
                {user.chatStatus && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span
                      className={cn("h-2 w-2 rounded-full mr-1.5 inline-block", {
                        "bg-green-500": user.chatStatus === "available",
                        "bg-red-500": user.chatStatus === "busy",
                        "bg-yellow-500": user.chatStatus === "in-meeting",
                        "bg-gray-400": user.chatStatus === "invisible" && currentUser?.id === user.id, // Só mostra invisível para o próprio usuário
                      })}
                    ></span>
                    {user.chatStatus === "invisible" && currentUser?.id === user.id
                      ? "Invisível"
                      : user.chatStatus === "available"
                        ? "Disponível"
                        : user.chatStatus === "busy"
                          ? "Ocupado"
                          : user.chatStatus === "in-meeting"
                            ? "Em Reunião"
                            : ""}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
      {/* Seção do Seletor de Status */}
      {canSetStatus && currentUser && (
        <div className="p-2 border-t">
          <ChatStatusSelector currentUser={currentUser} onStatusChange={onUserStatusChange} />
        </div>
      )}
    </div>
  )
}
