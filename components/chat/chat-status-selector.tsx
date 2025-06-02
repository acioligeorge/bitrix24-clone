"use client"

import type React from "react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Smile, CircleSlash, Users, EyeOff, ChevronDown, Loader2 } from "lucide-react"
import type { UserChatStatus, Employee } from "@/lib/types"
import { updateMyChatStatusAction } from "@/app/chat/actions"
import { useToast } from "@/components/ui/use-toast"

interface ChatStatusSelectorProps {
  currentUser: Employee
  onStatusChange: (newStatus: UserChatStatus) => void // Callback para atualizar o estado na página pai
}

interface StatusOption {
  value: UserChatStatus
  label: string
  icon: React.ElementType
}

const statusOptions: StatusOption[] = [
  { value: "available", label: "Disponível", icon: Smile },
  { value: "busy", label: "Ocupado", icon: CircleSlash },
  { value: "in-meeting", label: "Em Reunião", icon: Users },
  { value: "invisible", label: "Invisível", icon: EyeOff },
]

export function ChatStatusSelector({ currentUser, onStatusChange }: ChatStatusSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const currentStatus = currentUser.chatStatus || "available"
  const currentOption = statusOptions.find((opt) => opt.value === currentStatus) || statusOptions[0]

  const handleStatusSelect = async (newStatus: UserChatStatus) => {
    if (newStatus === currentStatus) return
    setIsLoading(true)
    const result = await updateMyChatStatusAction(newStatus)
    if (result.success && result.updatedUser) {
      onStatusChange(result.updatedUser.chatStatus || "available")
      toast({
        title: "Status Atualizado",
        description: `Seu status agora é ${statusOptions.find((s) => s.value === newStatus)?.label}.`,
      })
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" })
    }
    setIsLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start px-2 py-6 text-sm">
          <currentOption.icon
            className={`mr-2 h-4 w-4 ${
              currentStatus === "available"
                ? "text-green-500"
                : currentStatus === "busy"
                  ? "text-red-500"
                  : currentStatus === "in-meeting"
                    ? "text-yellow-500"
                    : currentStatus === "invisible"
                      ? "text-gray-500"
                      : ""
            }`}
          />
          <span className="flex-1">{currentOption.label}</span>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4 opacity-50" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="top" align="start">
        <DropdownMenuLabel>Definir seu status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statusOptions.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => handleStatusSelect(option.value)} disabled={isLoading}>
            <option.icon
              className={`mr-2 h-4 w-4 ${
                option.value === "available"
                  ? "text-green-500"
                  : option.value === "busy"
                    ? "text-red-500"
                    : option.value === "in-meeting"
                      ? "text-yellow-500"
                      : option.value === "invisible"
                        ? "text-gray-500"
                        : ""
              }`}
            />
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
