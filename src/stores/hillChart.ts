import { defineStore } from 'pinia'
import type { HillChartState, HillTrackable, Project } from '../schema/types'
import { sampleState } from '../data/sample'
import { HILL_CHART_STORAGE_KEY } from '../storage/loadState'

function findTrackableById(projects: Project[], id: string): HillTrackable | undefined {
  for (const project of projects) {
    if (project.id === id) return project
    for (const task of project.tasks) {
      if (task.id === id) return task
    }
  }
  return undefined
}

export const useHillChartStore = defineStore('hillChart', {
  state: (): HillChartState => structuredClone(sampleState),
  persist: {
    key: HILL_CHART_STORAGE_KEY,
  },
  actions: {
    setPosition(id: string, position: number) {
      const trackable = findTrackableById(this.projects, id)
      if (!trackable) return
      trackable.position = Math.min(100, Math.max(0, Math.round(position)))
      trackable.lastMovedAt = new Date().toISOString()
    },
  },
})
