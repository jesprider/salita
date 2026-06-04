import { describe, it, expect } from 'vitest'
import { canImport } from './importRules'
import type { HillChartState, Project } from './types'

const stubProject = { id: 'p1' } as Project

const base: HillChartState = {
  version: 1,
  exportedAt: null,
  demo: false,
  projects: [stubProject],
}

describe('canImport', () => {
  it('returns true when demo is true', () => {
    expect(canImport({ ...base, demo: true })).toBe(true)
  })

  it('returns true when projects is empty', () => {
    expect(canImport({ ...base, demo: false, projects: [] })).toBe(true)
  })

  it('returns false when demo false and projects exist', () => {
    expect(canImport(base)).toBe(false)
  })
})
