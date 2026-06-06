/** Local calendar date as YYYY-MM-DD (zero-padded). */
export function localDateString(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** True when dateStr is the same local calendar day as d (default now). */
export function isSameLocalDay(dateStr: string, d = new Date()): boolean {
  return dateStr === localDateString(d)
}

/** Ms until next local midnight (for OverviewView timer). */
export function msUntilLocalMidnight(d = new Date()): number {
  const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  return midnight.getTime() - d.getTime()
}
