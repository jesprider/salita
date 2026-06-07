<script setup lang="ts">
import { useHillCurve } from '../composables/useHillCurve'
import type { TrailGhost } from '../composables/chartMarkers'

defineProps<{
  cx: number
  cy: number
  radius: number
  color: string
  name: string
  up: number
  down: number
  ghosts: TrailGhost[]
  showTrail: boolean
}>()

const { curveX, curveY } = useHillCurve()

const emit = defineEmits<{
  (e: 'grab', ev: PointerEvent): void
  (e: 'open'): void
}>()
</script>

<template>
  <g class="cursor-grab" @pointerdown="emit('grab', $event)" @dblclick="emit('open')">
    <g v-if="showTrail" pointer-events="none">
      <circle
        v-for="(g, i) in ghosts"
        :key="i"
        :cx="curveX(g.position)"
        :cy="curveY(g.position)"
        :r="radius"
        :fill="color"
        :fill-opacity="g.opacity"
        stroke="#FDFAF4"
        stroke-width="1"
        stroke-opacity="0.5"
      />
    </g>
    <circle :cx="cx" :cy="cy" :r="radius" :fill="color" stroke="#FDFAF4" stroke-width="2" />
    <text
      :x="cx"
      :y="cy + radius + 18"
      text-anchor="middle"
      font-size="15"
      fill="#3C3530"
      font-family="Inter, sans-serif"
    >
      {{ name }}
    </text>
    <text
      :x="cx"
      :y="cy + radius + 34"
      text-anchor="middle"
      font-size="13"
      fill="#3C3530"
      font-family="Inter, sans-serif"
    >
      ↑{{ up }} ↓{{ down }}
    </text>
  </g>
</template>
