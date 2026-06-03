import type { Force, HillTrackable } from '../schema/types'

export const PEAK_POSITION = 50
export const BLOCKER_SNAP_POSITION = 45

export function hasActiveDownForces(forces: Force[]): boolean {
  return forces.some((f) => f.direction === 'down' && f.status === 'active')
}

export function snapIfDownhillWithBlockers(trackable: HillTrackable): void {
  if (trackable.position > PEAK_POSITION && hasActiveDownForces(trackable.forces)) {
    trackable.position = BLOCKER_SNAP_POSITION
    trackable.lastMovedAt = new Date().toISOString()
  }
}

/** Used by setPosition in iteration 16 — not wired yet. */
export function canCrossPeak(
  forces: Force[],
  newPosition: number,
  currentPosition: number,
): boolean {
  const crossingRightPastPeak =
    newPosition > PEAK_POSITION && currentPosition <= PEAK_POSITION
  if (crossingRightPastPeak && hasActiveDownForces(forces)) {
    return false
  }
  return true
}
