import { describe, it, expect } from 'vitest'
import type { Force, Project } from '../schema/types'
import { activeCount, overviewDotViews, projectDotViews } from './dotViews'

function force(partial: Partial<Force>): Force {
  return {
    id: 'f',
    direction: 'up',
    label: 'x',
    owner: null,
    isPrimary: false,
    status: 'active',
    createdAt: '2026-05-01T10:00:00Z',
    resolvedAt: null,
    resolutionReason: null,
    ...partial,
  }
}

function project(partial: Partial<Project>): Project {
  return {
    id: 'p',
    name: 'P',
    color: 'olive',
    position: 10,
    lastMovedAt: '2026-05-01T10:00:00Z',
    forces: [],
    snapshots: [],
    tasks: [],
    ...partial,
  }
}

describe('activeCount', () => {
  it('counts only active forces of the given direction', () => {
    const forces = [
      force({ direction: 'up', status: 'active' }),
      force({ direction: 'up', status: 'resolved' }),
      force({ direction: 'down', status: 'active' }),
    ]
    expect(activeCount(forces, 'up')).toBe(1)
    expect(activeCount(forces, 'down')).toBe(1)
  })
})

describe('overviewDotViews', () => {
  it('maps each project to a radius-16 dot in its palette color with active counts', () => {
    const dots = overviewDotViews([
      project({
        id: 'proj_1',
        name: 'Q3',
        color: 'terracotta',
        position: 23,
        forces: [force({ direction: 'up' }), force({ direction: 'down' })],
      }),
    ])
    expect(dots).toHaveLength(1)
    expect(dots[0]).toMatchObject({
      id: 'proj_1',
      position: 23,
      color: '#C56B4A',
      radius: 16,
      name: 'Q3',
      up: 1,
      down: 1,
    })
  })
})

describe('projectDotViews', () => {
  it('returns the project dot first (radius 22) then each task (radius 11), all in project color', () => {
    const dots = projectDotViews(
      project({
        id: 'proj_1',
        color: 'terracotta',
        position: 23,
        forces: [force({ direction: 'up' })],
        tasks: [
          {
            id: 'task_a',
            name: 'A',
            position: 12,
            lastMovedAt: '2026-05-01T10:00:00Z',
            forces: [force({ direction: 'down' }), force({ direction: 'down', status: 'resolved' })],
            snapshots: [],
          },
        ],
      }),
    )
    expect(dots).toHaveLength(2)
    expect(dots[0]).toMatchObject({ id: 'proj_1', radius: 22, color: '#C56B4A', up: 1, down: 0 })
    expect(dots[1]).toMatchObject({ id: 'task_a', radius: 11, color: '#C56B4A', up: 0, down: 1 })
  })

  it('returns just the project dot when there are no tasks', () => {
    const dots = projectDotViews(project({ tasks: [] }))
    expect(dots).toHaveLength(1)
    expect(dots[0].radius).toBe(22)
  })
})
