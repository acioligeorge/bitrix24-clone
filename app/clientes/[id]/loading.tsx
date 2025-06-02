import { CardContent } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
// app/clientes/[id]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingClientDetails() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" /> {/* Back button */}
          <Skeleton className="h-9 w-48" /> {/* Client Name */}
          <Skeleton className="h-6 w-20 rounded-full" /> {/* Client Number Badge */}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36" /> {/* Edit Client Button */}
          <Skeleton className="h-10 w-40" /> {/* New Project Button */}
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-1/3 mb-2" /> {/* Card Title */}
          <Skeleton className="h-4 w-2/3" /> {/* Card Description */}
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {/* Coluna 1: Identificação */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/4 mb-1" /> {/* Sub-Title */}
            <Skeleton className="h-5 w-3/4" /> {/* Client Number */}
            <Skeleton className="h-5 w-2/3" /> {/* NIF */}
            <Skeleton className="h-5 w-1/2" /> {/* Type */}
            <Skeleton className="h-5 w-3/4" /> {/* Responsible */}
          </div>
          {/* Coluna 2: Contato */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/4 mb-1" /> {/* Sub-Title */}
            <Skeleton className="h-5 w-full" /> {/* Email */}
            <Skeleton className="h-5 w-2/3" /> {/* Phone */}
            <Skeleton className="h-5 w-3/4" /> {/* Company */}
          </div>
          {/* Coluna 3: Histórico */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/4 mb-1" /> {/* Sub-Title */}
            <Skeleton className="h-5 w-3/4" /> {/* Client Since */}
            <Skeleton className="h-5 w-full" /> {/* Last Updated */}
          </div>
        </CardContent>
      </Card>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-40" /> {/* Projects Title */}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
