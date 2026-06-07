import { localDateString } from '../lib/localDate'

export const STALE_RED = '#C04A2D'
export const STALENESS_FULL_DAYS = 5

const MS_PER_DAY = 86_400_000

function parseLocalDateYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Local calendar days from lastMovedAt's day through today (today = 0). */
export function daysSinceLastMove(lastMovedAt: string, today = new Date()): number {
  const moveDay = localDateString(new Date(lastMovedAt))
  const todayStr = localDateString(today)
  const diff =
    parseLocalDateYmd(todayStr).getTime() - parseLocalDateYmd(moveDay).getTime()
  return Math.max(0, Math.round(diff / MS_PER_DAY))
}

export function stalenessRatio(daysSinceLastMove: number): number {
  return Math.min(Math.max(0, daysSinceLastMove) / STALENESS_FULL_DAYS, 1)
}

function parseHexChannel(hex: string, start: number): number {
  return parseInt(hex.slice(start, start + 2), 16)
}

function channelToHex(n: number): string {
  return Math.round(n).toString(16).padStart(2, '0').toUpperCase()
}

/** sRGB lerp between two #RRGGBB hex colors; t clamped to [0, 1]. */
export function lerpHexColor(from: string, to: string, t: number): string {
  const clamped = Math.min(1, Math.max(0, t))
  const r = parseHexChannel(from, 1) + (parseHexChannel(to, 1) - parseHexChannel(from, 1)) * clamped
  const g = parseHexChannel(from, 3) + (parseHexChannel(to, 3) - parseHexChannel(from, 3)) * clamped
  const b = parseHexChannel(from, 5) + (parseHexChannel(to, 5) - parseHexChannel(from, 5)) * clamped
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`
}

export function staleFillColor(
  projectColorHex: string,
  lastMovedAt: string,
  today = new Date(),
): string {
  const ratio = stalenessRatio(daysSinceLastMove(lastMovedAt, today))
  if (ratio === 0) return projectColorHex
  return lerpHexColor(projectColorHex, STALE_RED, ratio)
}
