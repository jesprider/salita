import type { Force, ForceDirection, ForceStatus, Project, Task } from '../schema/types'

export type DotKind = 'project' | 'task'

export interface ResolvedDot {
  kind: DotKind
  dot: Project | Task
}

export function resolveDotInProject(project: Project, id: string): ResolvedDot | null {
  if (project.id === id) return { kind: 'project', dot: project }
  const task = project.tasks.find((t) => t.id === id)
  if (task) return { kind: 'task', dot: task }
  return null
}

export function forcesByStatus(
  forces: Force[],
  direction: ForceDirection,
  status: ForceStatus,
): Force[] {
  return forces
    .filter((f) => f.direction === direction && f.status === status)
    .sort((a, b) => {
      const aDate = status === 'resolved' ? (a.resolvedAt ?? a.createdAt) : a.createdAt
      const bDate = status === 'resolved' ? (b.resolvedAt ?? b.createdAt) : b.createdAt
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })
}
