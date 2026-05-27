import { defineStore } from 'pinia'
import type { HillChartState, Project, Task } from '../schema/types'
import { sampleState } from '../data/sample'

function findDot(projects: Project[], id: string): Project | Task | undefined {
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
  actions: {
    setPosition(id: string, position: number) {
      const dot = findDot(this.projects, id)
      if (!dot) return
      dot.position = Math.min(100, Math.max(0, Math.round(position)))
      dot.lastMovedAt = new Date().toISOString()
    },
  },
})
