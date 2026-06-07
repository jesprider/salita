// src/domain/doneRules.ts
import { DONE_POSITION } from './staleness'
import type { Project } from '../schema/types'

export const PROJECT_DONE_CLAMP = 99

export function allTasksDone(project: Project): boolean {
  return project.tasks.every((t) => t.position === DONE_POSITION)
}

export function clampProjectDonePosition(project: Project, targetPosition: number): number {
  if (targetPosition !== DONE_POSITION) return targetPosition
  return allTasksDone(project) ? DONE_POSITION : PROJECT_DONE_CLAMP
}
