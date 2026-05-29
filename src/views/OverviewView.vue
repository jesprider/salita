<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useHillChartStore } from '../stores/hillChart'
import { overviewDotViews } from '../composables/dotViews'
import HillChart from '../components/HillChart.vue'

const store = useHillChartStore()
const { projects } = storeToRefs(store)
const dots = computed(() => overviewDotViews(projects.value))

function onMove(id: string, position: number) {
  store.setPosition(id, position)
}
</script>

<template>
  <section class="px-6 py-6">
    <div class="mx-auto max-w-[1200px]">
      <HillChart :dots="dots" @move="onMove" />
    </div>
  </section>
</template>
