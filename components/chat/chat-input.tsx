"use client"

import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Mic } from "lucide-react" // Adicionando ícones

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void> // Tornando assíncrono
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isSending) {
      setIsSending(true)
      try {
        await onSendMessage(message.trim())
        setMessage("")
      } catch (error) {
        console.error("Failed to send message:", error)
        // Adicionar feedback de erro para o usuário aqui, se necessário
      } finally {
        setIsSending(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" type="button" disabled={disabled || isSending}>
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Anexar arquivo</span>
        </Button>
        <Input
          type="text"
          placeholder={disabled ? "Selecione uma conversa" : "Digite uma mensagem..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
          disabled={disabled || isSending}
        />
        <Button variant="ghost" size="icon" type="button" disabled={disabled || isSending}>
          <Mic className="h-5 w-5" />
          <span className="sr-only">Gravar áudio</span>
        </Button>
        <Button type="submit" size="icon" disabled={!message.trim() || disabled || isSending}>
          {isSending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span className="sr-only">Enviar</span>
        </Button>
      </div>
    </form>
  )
}
