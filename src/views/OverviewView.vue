<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHillChartStore } from '../stores/hillChart'
import { overviewMarkers } from '../composables/chartMarkers'
import AppHeader from '../components/AppHeader.vue'
import HillChart from '../components/HillChart.vue'

const store = useHillChartStore()
const router = useRouter()
const { projects } = storeToRefs(store)
const markers = computed(() => overviewMarkers(projects.value))

function onMove(id: string, position: number) {
  store.setPosition(id, position)
}

function onOpen(id: string) {
  router.push(`/projects/${id}`)
}
</script>

<template>
  <AppHeader />
  <section class="px-6 py-6">
    <div class="mx-auto max-w-[1200px]">
      <HillChart :markers="markers" @move="onMove" @open="onOpen" />
    </div>
  </section>
</template>
