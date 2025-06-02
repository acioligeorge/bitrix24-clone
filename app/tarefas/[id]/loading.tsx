import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingTaskDetails() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" /> {/* Back button */}
          <Skeleton className="h-9 w-64" /> {/* Task Title */}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36" /> {/* Edit Task Button */}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-8 w-1/3" /> {/* Description Label */}
          <Skeleton className="h-20 w-full" /> {/* Description Content */}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" /> {/* Details Label */}
          <Skeleton className="h-6 w-full" /> {/* Project */}
          <Skeleton className="h-6 w-full" /> {/* Assignee */}
          <Skeleton className="h-6 w-3/4" /> {/* Status */}
          <Skeleton className="h-6 w-3/4" /> {/* Priority */}
          <Skeleton className="h-6 w-full" /> {/* Due Date */}
          <Skeleton className="h-6 w-full" /> {/* Created At */}
        </div>
      </div>
      {/* Futuras seções (comentários, etc.) podem ter seus skeletons aqui */}
    </div>
  )
}
