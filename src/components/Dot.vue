<script setup lang="ts">
defineProps<{
  cx: number
  cy: number
  radius: number
  color: string
  name: string
  up: number
  down: number
}>()

const emit = defineEmits<{
  (e: 'grab', ev: PointerEvent): void
}>()
</script>

<template>
  <g class="cursor-grab" @pointerdown="emit('grab', $event)">
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
