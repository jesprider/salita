import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { BLOCKER_SNAP_POSITION } from '../domain/forceRules'
import { useHillChartStore } from './hillChart'

describe('hillChart store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('seeds from the sample data', () => {
    const store = useHillChartStore()
    expect(store.projects.length).toBe(4)
    expect(store.projects[0].id).toBe('proj_1')
  })

  it('setPosition updates a project position and lastMovedAt', () => {
    const store = useHillChartStore()
    const before = store.projects[0].lastMovedAt
    store.setPosition('proj_1', 55)
    expect(store.projects[0].position).toBe(55)
    expect(store.projects[0].lastMovedAt).not.toBe(before)
    expect(Date.now() - new Date(store.projects[0].lastMovedAt).getTime()).toBeLessThan(5000)
  })

  it('setPosition rounds and clamps to 0..100', () => {
    const store = useHillChartStore()
    store.setPosition('proj_1', 23.7)
    expect(store.projects[0].position).toBe(24)
    store.setPosition('proj_1', 150)
    expect(store.projects[0].position).toBe(100)
    store.setPosition('proj_1', -5)
    expect(store.projects[0].position).toBe(0)
  })

  it('setPosition is a no-op for an unknown id', () => {
    const store = useHillChartStore()
    expect(() => store.setPosition('nope', 10)).not.toThrow()
  })

  describe('force mutations', () => {
    it('addForce up at position 70 keeps position', () => {
      const store = useHillChartStore()
      store.setPosition('proj_1', 70)
      const countBefore = store.projects[0].forces.length

      store.addForce('proj_1', 'up', 'Helper', 'Sam')

      expect(store.projects[0].position).toBe(70)
      expect(store.projects[0].forces.length).toBe(countBefore + 1)
      const added = store.projects[0].forces.at(-1)!
      expect(added.direction).toBe('up')
      expect(added.label).toBe('Helper')
      expect(added.owner).toBe('Sam')
      expect(added.isPrimary).toBe(false)
      expect(added.status).toBe('active')
    })

    it('addForce down at position 70 snaps to 45', () => {
      const store = useHillChartStore()
      store.setPosition('proj_1', 70)

      store.addForce('proj_1', 'down', 'New blocker')

      expect(store.projects[0].position).toBe(BLOCKER_SNAP_POSITION)
      expect(store.projects[0].forces.some((f) => f.label === 'New blocker')).toBe(true)
    })

    it('addForce down at position 40 does not move the dot', () => {
      const store = useHillChartStore()
      store.setPosition('proj_1', 40)

      store.addForce('proj_1', 'down', 'Uphill blocker')

      expect(store.projects[0].position).toBe(40)
    })

    it('resolveForce does not resolve the primary force', () => {
      const store = useHillChartStore()
      const primary = store.projects[0].forces.find((f) => f.isPrimary)!

      store.resolveForce('proj_1', primary.id)

      expect(primary.status).toBe('active')
      expect(primary.resolvedAt).toBeNull()
    })

    it('resolveForce stores an optional reason', () => {
      const store = useHillChartStore()
      const force = store.projects[0].forces.find((f) => f.id === 'f_1c')!

      store.resolveForce('proj_1', force.id, 'cleared in standup')

      expect(force.status).toBe('resolved')
      expect(force.resolutionReason).toBe('cleared in standup')
      expect(force.resolvedAt).not.toBeNull()
    })

    it('unresolveForce down at position 60 snaps to 45', () => {
      const store = useHillChartStore()
      store.setPosition('proj_1', 60)
      const force = store.projects[0].forces.find((f) => f.id === 'f_1c')!
      store.resolveForce('proj_1', force.id)

      store.unresolveForce('proj_1', force.id)

      expect(force.status).toBe('active')
      expect(store.projects[0].position).toBe(BLOCKER_SNAP_POSITION)
    })

    it('updateForce patches label and owner', () => {
      const store = useHillChartStore()
      const force = store.projects[0].forces.find((f) => f.id === 'f_1b')!

      store.updateForce('proj_1', force.id, { label: 'Renamed', owner: 'Jo' })

      expect(force.label).toBe('Renamed')
      expect(force.owner).toBe('Jo')
      expect(force.direction).toBe('up')
    })

    it('force actions no-op for unknown ids', () => {
      const store = useHillChartStore()
      const count = store.projects[0].forces.length

      expect(() => {
        store.addForce('nope', 'up', 'x')
        store.updateForce('nope', 'f_x', { label: 'y' })
        store.resolveForce('nope', 'f_x')
        store.unresolveForce('nope', 'f_x')
        store.addForce('proj_1', 'up', 'x')
        store.updateForce('proj_1', 'nope', { label: 'y' })
      }).not.toThrow()

      expect(store.projects[0].forces.length).toBe(count + 1)
    })
  })
})
