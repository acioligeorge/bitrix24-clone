"use client"

import { useState, useEffect } from "react"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"
import { getEmployees, getChatMessages, sendChatMessage, getEmployeeById } from "@/app/data" // Funções de dados
import type { Employee, ChatMessage, UserChatStatus } from "@/lib/types"
import { MessageSquare } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// Simulação do usuário logado (deveria vir do contexto de autenticação)
const CURRENT_USER_ID = "emp1" // Admin Acioli

export default function ChatPage() {
  const [users, setUsers] = useState<Employee[]>([])
  const [currentUser, setCurrentUser] = useState<Employee | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [selectedChatType, setSelectedChatType] = useState<"user" | "channel" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  const channels = [
    // Canais fixos para exemplo
    { id: "suporte-geral", name: "Suporte Geral", unread: 1 },
    { id: "dev-team", name: "Time Dev" },
  ]

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const fetchedUsers = await getEmployees()
        setUsers(fetchedUsers.filter((u) => u.id !== CURRENT_USER_ID && u.isActive))
        const loggedInUser = await getEmployeeById(CURRENT_USER_ID) // Usar getEmployeeById para ter o status
        setCurrentUser(loggedInUser || null)
      } catch (error) {
        console.error("Erro ao buscar dados iniciais do chat:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchMessages() {
      if (selectedChatId && selectedChatType) {
        setIsLoadingMessages(true)
        try {
          const fetchedMessages = await getChatMessages(selectedChatId, selectedChatType === "channel")
          setMessages(fetchedMessages)
        } catch (error) {
          console.error("Erro ao buscar mensagens:", error)
          setMessages([])
        } finally {
          setIsLoadingMessages(false)
        }
      } else {
        setMessages([])
      }
    }
    fetchMessages()
  }, [selectedChatId, selectedChatType])

  const handleSelectChat = (id: string, type: "user" | "channel") => {
    setSelectedChatId(id)
    setSelectedChatType(type)
  }

  const handleSendMessage = async (content: string) => {
    if (!currentUser || !selectedChatId || !selectedChatType) return

    const newMessageData: Omit<ChatMessage, "id" | "timestamp"> = {
      senderId: currentUser.id,
      content,
      type: "text",
    }
    if (selectedChatType === "user") {
      newMessageData.receiverId = selectedChatId
    } else {
      newMessageData.channelId = selectedChatId
    }

    try {
      const sentMessage = await sendChatMessage(newMessageData)
      setMessages((prevMessages) => [...prevMessages, sentMessage])
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      // Adicionar toast de erro aqui
    }
  }

  const handleUserStatusChange = (newStatus: UserChatStatus) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, chatStatus: newStatus })
      // Atualizar a lista de 'users' também se o currentUser estiver nela (não está neste caso)
      // ou re-fetch de todos os usuários se o status dos outros for importante em tempo real.
      // Por simplicidade, apenas atualizamos o currentUser localmente.
      // A action já revalida o path, então outros usuários verão a mudança ao recarregar.
    }
  }

  const selectedChatPartner = selectedChatType === "user" ? users.find((u) => u.id === selectedChatId) : undefined
  const chatTitle =
    selectedChatType === "channel" ? channels.find((c) => c.id === selectedChatId)?.name : selectedChatPartner?.name

  if (isLoading || !currentUser) {
    return (
      <div className="flex flex-col h-[calc(100vh-theme(spacing.20)-theme(spacing.8))]">
        {" "}
        {/* Ajuste de altura */}
        <div className="p-4 border-b flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Chat Interno</h1>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <Skeleton className="w-full md:w-80 border-r" />
          <div className="flex-1 flex flex-col p-4 space-y-4">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20)-theme(spacing.8))]">
      {" "}
      {/* Ajuste de altura */}
      <div className="p-4 border-b flex items-center gap-2">
        <MessageSquare className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Chat Interno</h1>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          users={users}
          channels={channels}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          currentUser={currentUser}
          onUserStatusChange={handleUserStatusChange}
        />
        <div className="flex-1 flex flex-col bg-muted/30">
          {selectedChatId ? (
            <>
              <div className="p-4 border-b bg-background">
                <h2 className="text-lg font-semibold">
                  {selectedChatType === "channel" ? `#${chatTitle}` : chatTitle || "Selecione uma conversa"}
                </h2>
                {selectedChatPartner && <p className="text-xs text-muted-foreground">{selectedChatPartner.position}</p>}
              </div>
              {isLoadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ChatMessages
                  messages={messages}
                  currentUser={currentUser}
                  chatPartner={selectedChatPartner}
                  users={[currentUser, ...users]}
                />
              )}
              <ChatInput onSendMessage={handleSendMessage} disabled={!selectedChatId} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <CardTitle className="text-primary">Bem-vindo ao Chat!</CardTitle>
                </CardHeader>
                <CardContent>
                  <MessageSquare className="mx-auto h-16 w-16 text-primary/50 mb-4" />
                  <p className="text-muted-foreground">
                    Selecione um canal ou usuário na barra lateral para iniciar uma conversa.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
