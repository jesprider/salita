import { describe, it, expect } from 'vitest'
import {
  STALE_RED,
  STALENESS_FULL_DAYS,
  daysSinceLastMove,
  stalenessRatio,
  lerpHexColor,
  staleFillColor,
} from './staleness'

const TERRACOTTA = '#C56B4A'
const TODAY = new Date(2026, 5, 7, 15, 0, 0) // local 2026-06-07

function isoOnLocalDay(y: number, m: number, d: number, hour = 10): string {
  return new Date(y, m - 1, d, hour, 0, 0).toISOString()
}

describe('daysSinceLastMove', () => {
  it('returns 0 when lastMovedAt is on the same local calendar day', () => {
    expect(daysSinceLastMove(isoOnLocalDay(2026, 6, 7, 9), TODAY)).toBe(0)
    expect(daysSinceLastMove(isoOnLocalDay(2026, 6, 7, 23), TODAY)).toBe(0)
  })

  it('returns 1 for yesterday', () => {
    expect(daysSinceLastMove(isoOnLocalDay(2026, 6, 6), TODAY)).toBe(1)
  })

  it('returns 5 for five local days ago', () => {
    expect(daysSinceLastMove(isoOnLocalDay(2026, 6, 2), TODAY)).toBe(5)
  })

  it('clamps future lastMovedAt to 0 days', () => {
    expect(daysSinceLastMove(isoOnLocalDay(2026, 6, 8), TODAY)).toBe(0)
  })
})

describe('stalenessRatio', () => {
  it('returns 0 for 0 days', () => {
    expect(stalenessRatio(0)).toBe(0)
  })

  it('returns 0.2 for 1 day', () => {
    expect(stalenessRatio(1)).toBeCloseTo(0.2)
  })

  it('returns 1 at STALENESS_FULL_DAYS', () => {
    expect(stalenessRatio(STALENESS_FULL_DAYS)).toBe(1)
  })

  it('caps at 1 beyond STALENESS_FULL_DAYS', () => {
    expect(stalenessRatio(10)).toBe(1)
  })
})

describe('lerpHexColor', () => {
  it('returns from color at t=0', () => {
    expect(lerpHexColor(TERRACOTTA, STALE_RED, 0)).toBe(TERRACOTTA)
  })

  it('returns to color at t=1', () => {
    expect(lerpHexColor(TERRACOTTA, STALE_RED, 1)).toBe(STALE_RED)
  })

  it('returns a valid #RRGGBB hex at midpoint', () => {
    const mid = lerpHexColor(TERRACOTTA, STALE_RED, 0.5)
    expect(mid).toMatch(/^#[0-9A-F]{6}$/)
    expect(mid).not.toBe(TERRACOTTA)
    expect(mid).not.toBe(STALE_RED)
  })
})

describe('staleFillColor', () => {
  it('returns project color unchanged when moved today', () => {
    expect(staleFillColor(TERRACOTTA, isoOnLocalDay(2026, 6, 7), TODAY)).toBe(TERRACOTTA)
  })

  it('returns an intermediate color for a partially stale dot', () => {
    const color = staleFillColor(TERRACOTTA, isoOnLocalDay(2026, 6, 6), TODAY)
    expect(color).not.toBe(TERRACOTTA)
    expect(color).not.toBe(STALE_RED)
    expect(color).toMatch(/^#[0-9A-F]{6}$/)
  })

  it('returns STALE_RED after STALENESS_FULL_DAYS', () => {
    expect(staleFillColor(TERRACOTTA, isoOnLocalDay(2026, 6, 2), TODAY)).toBe(STALE_RED)
  })

  it('returns STALE_RED when more than STALENESS_FULL_DAYS', () => {
    expect(staleFillColor(TERRACOTTA, isoOnLocalDay(2026, 5, 28), TODAY)).toBe(STALE_RED)
  })
})
