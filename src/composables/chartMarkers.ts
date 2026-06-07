import type { Force, ForceDirection, Project } from '../schema/types'
import { PALETTE } from '../schema/palette'
import { localDateString } from '../lib/localDate'
import { trailGhosts, type TrailGhost } from '../domain/trailGhosts'
import { staleFillColor } from '../domain/staleness'

export type { TrailGhost }

export interface ChartMarker {
  id: string
  position: number
  baseColor: string
  color: string
  radius: number
  name: string
  up: number
  down: number
  ghosts: TrailGhost[]
}

const OVERVIEW_RADIUS = 16
const PROJECT_RADIUS = 22
const TASK_RADIUS = 11

export function activeCount(forces: Force[], direction: ForceDirection): number {
  return forces.filter((f) => f.direction === direction && f.status === 'active').length
}

export function overviewMarkers(projects: Project[]): ChartMarker[] {
  const today = localDateString()
  return projects.map((p) => {
    const baseColor = PALETTE[p.color]
    return {
      id: p.id,
      position: p.position,
      baseColor,
      color: staleFillColor(baseColor, p.lastMovedAt),
      radius: OVERVIEW_RADIUS,
      name: p.name,
      up: activeCount(p.forces, 'up'),
      down: activeCount(p.forces, 'down'),
      ghosts: trailGhosts(p.snapshots, today),
    }
  })
}

export function markersForProject(project: Project): ChartMarker[] {
  const today = localDateString()
  const baseColor = PALETTE[project.color]
  const projectMarker: ChartMarker = {
    id: project.id,
    position: project.position,
    baseColor,
    color: staleFillColor(baseColor, project.lastMovedAt),
    radius: PROJECT_RADIUS,
    name: project.name,
    up: activeCount(project.forces, 'up'),
    down: activeCount(project.forces, 'down'),
    ghosts: trailGhosts(project.snapshots, today),
  }
  const taskMarkers: ChartMarker[] = project.tasks.map((t) => ({
    id: t.id,
    position: t.position,
    baseColor,
    color: staleFillColor(baseColor, t.lastMovedAt),
    radius: TASK_RADIUS,
    name: t.name,
    up: activeCount(t.forces, 'up'),
    down: activeCount(t.forces, 'down'),
    ghosts: trailGhosts(t.snapshots, today),
  }))
  return [projectMarker, ...taskMarkers]
}
