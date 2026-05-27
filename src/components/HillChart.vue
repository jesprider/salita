<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useHillChartStore } from '../stores/hillChart'
import { useHillCurve } from '../composables/useHillCurve'
import { PALETTE } from '../schema/palette'
import type { Project } from '../schema/types'
import Dot from './Dot.vue'

const store = useHillChartStore()
const { projects } = storeToRefs(store)
const { CHART, curvePath, curveX, curveY } = useHillCurve()

const path = curvePath()
const baseline = CHART.height - CHART.bottomPad

function activeCount(project: Project, direction: 'up' | 'down'): number {
  return project.forces.filter((f) => f.direction === direction && f.status === 'active').length
}
</script>

<template>
  <svg
    :viewBox="`0 0 ${CHART.width} ${CHART.height}`"
    class="h-auto w-full select-none"
    role="img"
    aria-label="Hill chart of projects"
  >
    <path :d="`${path} L ${CHART.width} ${baseline} L 0 ${baseline} Z`" fill="#E8D9BD" opacity="0.45" />
    <path :d="path" fill="none" stroke="#E8D9BD" stroke-width="3" />
    <line :x1="0" :y1="baseline" :x2="CHART.width" :y2="baseline" stroke="#E8D9BD" stroke-width="2" />

    <Dot
      v-for="p in projects"
      :key="p.id"
      :cx="curveX(p.position)"
      :cy="curveY(p.position)"
      :radius="16"
      :color="PALETTE[p.color]"
      :name="p.name"
      :up="activeCount(p, 'up')"
      :down="activeCount(p, 'down')"
    />
  </svg>
</template>
