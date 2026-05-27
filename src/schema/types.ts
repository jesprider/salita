export type ForceDirection = 'up' | 'down'
export type ForceStatus = 'active' | 'resolved'
export type ProjectColor =
  | 'terracotta'
  | 'mustard'
  | 'olive'
  | 'rust'
  | 'plum'
  | 'sage'
  | 'dusty-blue'
  | 'warm-pink'

export interface Source {
  system?: string
  id?: string
  url?: string
}

export interface Force {
  id: string
  direction: ForceDirection
  label: string
  owner: string | null
  isPrimary: boolean
  status: ForceStatus
  createdAt: string
  resolvedAt: string | null
  resolutionReason: string | null
}

export interface Snapshot {
  date: string
  position: number
}

export interface Task {
  id: string
  name: string
  source?: Source
  position: number
  lastMovedAt: string
  forces: Force[]
  snapshots: Snapshot[]
}

export interface Project {
  id: string
  name: string
  color: ProjectColor
  source?: Source
  position: number
  lastMovedAt: string
  forces: Force[]
  snapshots: Snapshot[]
  tasks: Task[]
}

export interface HillChartState {
  version: number
  exportedAt: string | null
  projects: Project[]
}
