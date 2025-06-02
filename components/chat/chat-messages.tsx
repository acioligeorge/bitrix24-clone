"use client"

import type { ChatMessage, Employee } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useEffect, useRef } from "react"

interface ChatMessagesProps {
  messages: ChatMessage[]
  currentUser: Employee // Para identificar mensagens próprias
  chatPartner?: Employee // Para DMs, para mostrar avatar do parceiro
  users: Employee[] // Para buscar info do sender
}

export function ChatMessages({ messages, currentUser, chatPartner, users }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  const getUserById = (id: string) => users.find((u) => u.id)

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight
    }
  }, [messages])

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Selecione uma conversa para começar ou envie uma mensagem.</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef} viewportRef={viewportRef}>
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUser.id
          const sender = getUserById(message.senderId) || { name: "Desconhecido", id: "unknown" }
          const senderAvatar = sender.avatarUrl || `/placeholder.svg?height=40&width=40&query=avatar+${sender.name}`
          const senderFallback = sender.name.substring(0, 2).toUpperCase()

          return (
            <div
              key={message.id}
              className={cn("flex items-end space-x-2", isCurrentUser ? "justify-end" : "justify-start")}
            >
              {!isCurrentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={senderAvatar || "/placeholder.svg"} />
                  <AvatarFallback>{senderFallback}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-xs lg:max-w-md p-3 rounded-lg",
                  isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {!isCurrentUser && <p className="text-xs font-semibold mb-1">{sender.name}</p>}
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70 text-right">
                  {format(new Date(message.timestamp), "HH:mm", { locale: ptBR })}
                </p>
              </div>
              {isCurrentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      currentUser.avatarUrl || `/placeholder.svg?height=40&width=40&query=avatar+${currentUser.name}`
                    }
                  />
                  <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
