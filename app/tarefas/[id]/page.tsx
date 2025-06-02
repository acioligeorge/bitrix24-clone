import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getTaskById, getProjectById, getEmployeeById, getProjects, getEmployees } from "@/app/data"
import TaskDetailsClientPart from "./task-details-client"
import LoadingTaskDetails from "./loading"

interface TaskDetailsPageProps {
  params: { id: string }
}

async function TaskDetailsPageContent({ params }: TaskDetailsPageProps) {
  const taskId = params.id
  const task = await getTaskById(taskId)

  if (!task) {
    notFound()
  }

  // Buscar dados relacionados em paralelo
  const [project, assignee, allProjects, allEmployees] = await Promise.all([
    task.projectId ? getProjectById(task.projectId) : Promise.resolve(null),
    task.assigneeId ? getEmployeeById(task.assigneeId) : Promise.resolve(null),
    getProjects().then((projs) => projs.map((p) => ({ id: p.id, name: p.name }))),
    getEmployees().then((emps) => emps.filter((e) => e.isActive).map((e) => ({ id: e.id, name: e.name }))),
  ])

  return (
    <TaskDetailsClientPart
      task={task}
      projectName={project?.name}
      assigneeName={assignee?.name}
      allProjects={allProjects}
      allEmployees={allEmployees}
    />
  )
}

export default function Page({ params }: TaskDetailsPageProps) {
  return (
    <Suspense fallback={<LoadingTaskDetails />}>
      <TaskDetailsPageContent params={params} />
    </Suspense>
  )
}
