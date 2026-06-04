<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHillChartStore } from '../stores/hillChart'
import { overviewMarkers } from '../composables/chartMarkers'
import AppHeader from '../components/AppHeader.vue'
import HillChart from '../components/HillChart.vue'
import SidePanel from '../components/SidePanel.vue'

const store = useHillChartStore()
const router = useRouter()
const { projects } = storeToRefs(store)
const selectedTrackableId = ref<string | null>(null)

const markers = computed(() => overviewMarkers(projects.value))

const selectedProject = computed(() =>
  selectedTrackableId.value
    ? projects.value.find((p) => p.id === selectedTrackableId.value)
    : undefined,
)

watchEffect(() => {
  if (!selectedTrackableId.value) return
  if (!projects.value.some((p) => p.id === selectedTrackableId.value)) {
    selectedTrackableId.value = null
  }
})

function onMove(id: string, position: number) {
  store.setPosition(id, position)
}

function onOpen(id: string) {
  router.push(`/projects/${id}`)
}

function onTrackableClick(id: string) {
  selectedTrackableId.value = selectedTrackableId.value === id ? null : id
}
</script>

<template>
  <AppHeader />
  <section class="px-6 py-6">
    <div class="mx-auto flex max-w-[1400px] items-start gap-6">
      <div class="min-w-0 flex-1">
        <HillChart
          clickable
          :markers="markers"
          @move="onMove"
          @open="onOpen"
          @click="onTrackableClick"
        />
      </div>
      <SidePanel
        v-if="selectedProject && selectedTrackableId"
        :project="selectedProject"
        :trackable-id="selectedTrackableId"
        show-open-project
        @close="selectedTrackableId = null"
      />
    </div>
  </section>
</template>
