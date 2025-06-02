"use client"

import { useState, useRef, type ChangeEvent } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, XCircle } from "lucide-react"

interface ImageUploadProps {
  name: string
  currentImageUrl?: string | null
  defaultFallback: string
  onImageChange?: (file: File | null, previewUrl: string | null) => void // Adicionado previewUrl
  onImageRemove?: () => void // Para notificar a remoção
}

export function ImageUpload({
  name,
  currentImageUrl,
  defaultFallback,
  onImageChange,
  onImageRemove,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newPreviewUrl = reader.result as string
        setPreviewUrl(newPreviewUrl)
        if (onImageChange) onImageChange(file, newPreviewUrl)
      }
      reader.readAsDataURL(file)
    } else {
      // Se nenhum arquivo for selecionado (por exemplo, o usuário cancela a caixa de diálogo de arquivo)
      // Não alteramos o previewUrl, mantendo a imagem atual ou o preview anterior.
      // Se quisermos resetar ao cancelar, precisaríamos de lógica adicional.
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Limpa o input de arquivo
    }
    if (onImageChange) onImageChange(null, null) // Notifica que o arquivo foi removido
    if (onImageRemove) onImageRemove() // Notifica que a imagem foi removida (para o form saber que deve remover no backend)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const displayUrl = previewUrl || currentImageUrl

  return (
    <div className="flex flex-col items-center space-y-3">
      <div
        className="relative w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center cursor-pointer hover:border-primary transition-colors group"
        onClick={triggerFileInput}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && triggerFileInput()}
      >
        {displayUrl ? (
          <Image
            src={displayUrl || "/placeholder.svg"}
            alt="Avatar preview"
            fill
            sizes="128px"
            className="rounded-full object-cover"
          />
        ) : (
          <Avatar className="h-full w-full">
            <AvatarFallback className="text-4xl bg-muted group-hover:bg-muted/80 transition-colors">
              {defaultFallback}
            </AvatarFallback>
          </Avatar>
        )}
        {!displayUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <UploadCloud className="h-8 w-8 text-white" />
            <span className="text-xs text-white mt-1">Alterar foto</span>
          </div>
        )}
      </div>
      <Input
        type="file"
        name={name}
        id={name}
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/gif, image/webp"
        onChange={handleFileChange}
      />
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={triggerFileInput}>
          <UploadCloud className="mr-2 h-4 w-4" />
          Escolher Imagem
        </Button>
        {(displayUrl || previewUrl) && ( // Mostrar botão de remover se houver imagem atual ou preview
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveImage}
            className="text-destructive hover:text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Remover
          </Button>
        )}
      </div>
    </div>
  )
}
