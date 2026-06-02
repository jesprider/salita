import { describe, it, expect } from 'vitest'
import type { Project } from '../schema/types'
import { activeCount, overviewMarkers, markersForProject } from './chartMarkers'

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'proj_1',
    name: 'Alpha',
    color: 'terracotta',
    position: 30,
    lastMovedAt: '2026-05-01T10:00:00Z',
    forces: [],
    snapshots: [],
    tasks: [],
    ...overrides,
  }
}

describe('activeCount', () => {
  it('counts only active forces in the given direction', () => {
    expect(
      activeCount(
        [
          {
            id: 'f1',
            direction: 'up',
            label: 'A',
            owner: null,
            isPrimary: false,
            status: 'active',
            createdAt: '',
            resolvedAt: null,
            resolutionReason: null,
          },
          {
            id: 'f2',
            direction: 'up',
            label: 'B',
            owner: null,
            isPrimary: false,
            status: 'resolved',
            createdAt: '',
            resolvedAt: '',
            resolutionReason: null,
          },
          {
            id: 'f3',
            direction: 'down',
            label: 'C',
            owner: null,
            isPrimary: false,
            status: 'active',
            createdAt: '',
            resolvedAt: null,
            resolutionReason: null,
          },
        ],
        'up',
      ),
    ).toBe(1)
  })
})

describe('overviewMarkers', () => {
  it('maps each project to a radius-16 marker in its palette color with active counts', () => {
    const markers = overviewMarkers([
      project({
        forces: [
          {
            id: 'f1',
            direction: 'up',
            label: 'Boost',
            owner: null,
            isPrimary: false,
            status: 'active',
            createdAt: '',
            resolvedAt: null,
            resolutionReason: null,
          },
        ],
      }),
    ])
    expect(markers).toHaveLength(1)
    expect(markers[0]).toMatchObject({
      id: 'proj_1',
      radius: 16,
      color: '#C56B4A',
      up: 1,
      down: 0,
    })
  })
})

describe('markersForProject', () => {
  it('returns the project marker first (radius 22) then each task (radius 11), all in project color', () => {
    const markers = markersForProject(
      project({
        tasks: [
          {
            id: 'task_a',
            name: 'Task A',
            position: 40,
            lastMovedAt: '',
            forces: [
              {
                id: 'f1',
                direction: 'down',
                label: 'Block',
                owner: null,
                isPrimary: false,
                status: 'active',
                createdAt: '',
                resolvedAt: null,
                resolutionReason: null,
              },
            ],
            snapshots: [],
          },
        ],
      }),
    )
    expect(markers).toHaveLength(2)
    expect(markers[0]).toMatchObject({ id: 'proj_1', radius: 22, color: '#C56B4A', up: 0, down: 0 })
    expect(markers[1]).toMatchObject({ id: 'task_a', radius: 11, color: '#C56B4A', up: 0, down: 1 })
  })

  it('returns just the project marker when there are no tasks', () => {
    const markers = markersForProject(project({ tasks: [] }))
    expect(markers).toHaveLength(1)
    expect(markers[0].radius).toBe(22)
  })
})
