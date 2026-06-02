import type { Force, ForceDirection, Project } from '../schema/types'
import { PALETTE } from '../schema/palette'

export interface ChartMarker {
  id: string
  position: number
  color: string
  radius: number
  name: string
  up: number
  down: number
}

const OVERVIEW_RADIUS = 16
const PROJECT_RADIUS = 22
const TASK_RADIUS = 11

export function activeCount(forces: Force[], direction: ForceDirection): number {
  return forces.filter((f) => f.direction === direction && f.status === 'active').length
}

export function overviewMarkers(projects: Project[]): ChartMarker[] {
  return projects.map((p) => ({
    id: p.id,
    position: p.position,
    color: PALETTE[p.color],
    radius: OVERVIEW_RADIUS,
    name: p.name,
    up: activeCount(p.forces, 'up'),
    down: activeCount(p.forces, 'down'),
  }))
}

export function markersForProject(project: Project): ChartMarker[] {
  const color = PALETTE[project.color]
  const projectMarker: ChartMarker = {
    id: project.id,
    position: project.position,
    color,
    radius: PROJECT_RADIUS,
    name: project.name,
    up: activeCount(project.forces, 'up'),
    down: activeCount(project.forces, 'down'),
  }
  const taskMarkers: ChartMarker[] = project.tasks.map((t) => ({
    id: t.id,
    position: t.position,
    color,
    radius: TASK_RADIUS,
    name: t.name,
    up: activeCount(t.forces, 'up'),
    down: activeCount(t.forces, 'down'),
  }))
  return [projectMarker, ...taskMarkers]
}
