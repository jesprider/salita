<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useHillCurve } from '../composables/useHillCurve'
import type { ChartMarker as ChartMarkerModel } from '../composables/chartMarkers'
import MarkerChart from './MarkerChart.vue'
import MarkerTrail from './MarkerTrail.vue'

const props = defineProps<{
  markers: ChartMarkerModel[]
  clickable?: boolean
  selectedId?: string | null
}>()
const emit = defineEmits<{
  (e: 'move', id: string, position: number): void
  (e: 'open', id: string): void
  (e: 'click', id: string): void
}>()

const { CHART, curvePath, curveX, curveY, positionFromRatio } = useHillCurve()

const path = curvePath()
const baseline = CHART.height - CHART.bottomPad

const svgRef = ref<SVGSVGElement | null>(null)
let draggingId: string | null = null
let dragStartX = 0
let didDrag = false

const DRAG_THRESHOLD_PX = 4

function onMove(ev: PointerEvent) {
  if (!draggingId || !svgRef.value) return
  if (Math.abs(ev.clientX - dragStartX) > DRAG_THRESHOLD_PX) {
    didDrag = true
  }
  const rect = svgRef.value.getBoundingClientRect()
  if (rect.width === 0) return
  const ratio = (ev.clientX - rect.left) / rect.width
  emit('move', draggingId, positionFromRatio(ratio))
}

function onUp() {
  const id = draggingId
  if (id && !didDrag && props.clickable) {
    emit('click', id)
  }
  draggingId = null
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
}

function onGrab(id: string, ev: PointerEvent) {
  ev.preventDefault()
  draggingId = id
  dragStartX = ev.clientX
  didDrag = false
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
    <line
      :x1="0"
      :y1="baseline"
      :x2="CHART.width"
      :y2="baseline"
      stroke="#E8D9BD"
      stroke-width="2"
    />

    <g v-for="m in markers" :key="m.id">
      <MarkerTrail
        v-if="m.id === selectedId"
        :ghosts="m.ghosts"
        :radius="m.radius"
        :color="m.baseColor"
      />
      <MarkerChart
        :cx="curveX(m.position)"
        :cy="curveY(m.position)"
        :radius="m.radius"
        :color="m.color"
        :staleness-satellites="m.stalenessSatellites"
        :name="m.name"
        :up="m.up"
        :down="m.down"
        @grab="(ev: PointerEvent) => onGrab(m.id, ev)"
        @open="emit('open', m.id)"
      />
    </g>
  </svg>
</template>
