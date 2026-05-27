<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useHillChartStore } from '../stores/hillChart'
import { useHillCurve } from '../composables/useHillCurve'
import { PALETTE } from '../schema/palette'
import type { Project } from '../schema/types'
import Dot from './Dot.vue'

const store = useHillChartStore()
const { projects } = storeToRefs(store)
const { CHART, curvePath, curveX, curveY, positionFromRatio } = useHillCurve()

const path = curvePath()
const baseline = CHART.height - CHART.bottomPad

const svgRef = ref<SVGSVGElement | null>(null)
let draggingId: string | null = null

function activeCount(project: Project, direction: 'up' | 'down'): number {
  return project.forces.filter((f) => f.direction === direction && f.status === 'active').length
}

function onMove(ev: PointerEvent) {
  if (!draggingId || !svgRef.value) return
  const rect = svgRef.value.getBoundingClientRect()
  if (rect.width === 0) return
  const ratio = (ev.clientX - rect.left) / rect.width
  store.setPosition(draggingId, positionFromRatio(ratio))
}

function onUp() {
  draggingId = null
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
}

function onGrab(id: string, ev: PointerEvent) {
  ev.preventDefault()
  draggingId = id
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

onBeforeUnmount(onUp)
</script>

<template>
  <svg
    ref="svgRef"
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
      @grab="(ev: PointerEvent) => onGrab(p.id, ev)"
    />
  </svg>
</template>
