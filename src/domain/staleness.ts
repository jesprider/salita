import { localDateString } from '../lib/localDate'

export const STALE_RED = '#C04A2D'
export const STALENESS_MAX_SATELLITES = 4

/** First local calendar day after a move that shows a staleness satellite. */
export const STALENESS_SATELLITE_START_DAY = 2

const MS_PER_DAY = 86_400_000

function parseLocalDateYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Local calendar days from lastMovedAt's day through today (today = 0). */
export function daysSinceLastMove(lastMovedAt: string, today = new Date()): number {
  const moveDay = localDateString(new Date(lastMovedAt))
  const todayStr = localDateString(today)
  const diff = parseLocalDateYmd(todayStr).getTime() - parseLocalDateYmd(moveDay).getTime()
  return Math.max(0, Math.round(diff / MS_PER_DAY))
}

/**
 * Staleness satellite count: one dot per day without movement from day 2 onward, max 4.
 * Moved today or yesterday → 0; 2 days → 1; 5+ days → 4.
 */
export function stalenessSatelliteCount(lastMovedAt: string, today = new Date()): number {
  const days = daysSinceLastMove(lastMovedAt, today)
  if (days < STALENESS_SATELLITE_START_DAY) return 0
  return Math.min(days - 1, STALENESS_MAX_SATELLITES)
}
