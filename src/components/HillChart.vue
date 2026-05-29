<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useHillCurve } from '../composables/useHillCurve'
import type { DotView } from '../composables/dotViews'
import Dot from './Dot.vue'

defineProps<{ dots: DotView[] }>()
const emit = defineEmits<{
  (e: 'move', id: string, position: number): void
  (e: 'open', id: string): void
}>()

const { CHART, curvePath, curveX, curveY, positionFromRatio } = useHillCurve()

const path = curvePath()
const baseline = CHART.height - CHART.bottomPad

const svgRef = ref<SVGSVGElement | null>(null)
let draggingId: string | null = null

function onMove(ev: PointerEvent) {
  if (!draggingId || !svgRef.value) return
  const rect = svgRef.value.getBoundingClientRect()
  if (rect.width === 0) return
  const ratio = (ev.clientX - rect.left) / rect.width
  emit('move', draggingId, positionFromRatio(ratio))
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
    aria-label="Hill chart"
  >
    <path
      :d="`${path} L ${CHART.width} ${baseline} L 0 ${baseline} Z`"
      fill="#E8D9BD"
      opacity="0.45"
    />
    <path :d="path" fill="none" stroke="#E8D9BD" stroke-width="3" />
    <line :x1="0" :y1="baseline" :x2="CHART.width" :y2="baseline" stroke="#E8D9BD" stroke-width="2" />

    <Dot
      v-for="d in dots"
      :key="d.id"
      :cx="curveX(d.position)"
      :cy="curveY(d.position)"
      :radius="d.radius"
      :color="d.color"
      :name="d.name"
      :up="d.up"
      :down="d.down"
      @grab="(ev: PointerEvent) => onGrab(d.id, ev)"
      @open="emit('open', d.id)"
    />
  </svg>
</template>
