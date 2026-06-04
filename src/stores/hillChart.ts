import { defineStore } from 'pinia'
import type {
  Force,
  ForceDirection,
  HillChartState,
  HillTrackable,
  Project,
  Source,
} from '../schema/types'
import { sampleState } from '../data/sample'
import { snapIfDownhillWithBlockers } from '../domain/forceRules'
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

function findForce(trackable: HillTrackable, forceId: string): Force | undefined {
  return trackable.forces.find((f) => f.id === forceId)
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

    updateTrackable(trackableId: string, patch: { name?: string; source?: Source | null }) {
      const trackable = findTrackableById(this.projects, trackableId)
      if (!trackable) return

      if (patch.name !== undefined) {
        const trimmed = patch.name.trim()
        if (!trimmed) return
        trackable.name = trimmed
      }

      if (patch.source !== undefined) {
        if (patch.source === null) {
          delete trackable.source
        } else {
          trackable.source = patch.source
        }
      }
    },

    addForce(trackableId: string, direction: ForceDirection, label: string, owner?: string | null) {
      const trackable = findTrackableById(this.projects, trackableId)
      if (!trackable) return

      trackable.forces.push({
        id: `f_${crypto.randomUUID()}`,
        direction,
        label,
        owner: owner ?? null,
        isPrimary: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        resolvedAt: null,
        resolutionReason: null,
      })

      if (direction === 'down') {
        snapIfDownhillWithBlockers(trackable)
      }
    },

    updateForce(
      trackableId: string,
      forceId: string,
      patch: { label?: string; owner?: string | null },
    ) {
      const trackable = findTrackableById(this.projects, trackableId)
      if (!trackable) return
      const force = findForce(trackable, forceId)
      if (!force) return
      if (patch.label === undefined && patch.owner === undefined) return

      if (patch.label !== undefined) force.label = patch.label
      if (patch.owner !== undefined) force.owner = patch.owner
    },

    resolveForce(trackableId: string, forceId: string, reason?: string) {
      const trackable = findTrackableById(this.projects, trackableId)
      if (!trackable) return
      const force = findForce(trackable, forceId)
      if (!force || force.isPrimary || force.status === 'resolved') return

      force.status = 'resolved'
      force.resolvedAt = new Date().toISOString()
      force.resolutionReason = reason ?? null
    },

    unresolveForce(trackableId: string, forceId: string) {
      const trackable = findTrackableById(this.projects, trackableId)
      if (!trackable) return
      const force = findForce(trackable, forceId)
      if (!force || force.status !== 'resolved') return

      force.status = 'active'
      force.resolvedAt = null
      force.resolutionReason = null

      if (force.direction === 'down') {
        snapIfDownhillWithBlockers(trackable)
      }
    },
  },
})
