import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
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
})
