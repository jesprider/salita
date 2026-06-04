import type { HillChartState } from './types'

export function canImport(state: HillChartState): boolean {
  return state.demo === true || state.projects.length === 0
}
