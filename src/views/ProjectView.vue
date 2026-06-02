<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHillChartStore } from '../stores/hillChart'
import { markersForProject } from '../composables/chartMarkers'
import HillChart from '../components/HillChart.vue'
import SidePanel from '../components/SidePanel.vue'

const props = defineProps<{ id: string }>()

const store = useHillChartStore()
const router = useRouter()
const { projects } = storeToRefs(store)
const selectedTrackableId = ref<string | null>(null)

const project = computed(() => projects.value.find((p) => p.id === props.id))
const markers = computed(() => (project.value ? markersForProject(project.value) : []))

watchEffect(() => {
  if (!project.value) router.replace('/projects')
})

watchEffect(() => {
  if (!project.value || !selectedTrackableId.value) return
  const ids = markers.value.map((m) => m.id)
  if (!ids.includes(selectedTrackableId.value)) {
    selectedTrackableId.value = null
  }
})

function onMove(id: string, position: number) {
  store.setPosition(id, position)
}

function onTrackableClick(id: string) {
  selectedTrackableId.value = selectedTrackableId.value === id ? null : id
}
</script>

<template>
  <header class="px-6 py-4">
    <RouterLink to="/projects" class="text-sm text-text-warm/80 hover:text-text-warm">
      ← Overview
    </RouterLink>
    <h1 v-if="project" class="mt-1 font-heading text-3xl">{{ project.name }}</h1>
  </header>
  <section class="px-6 pb-6">
    <div class="mx-auto flex max-w-[1400px] items-start gap-6">
      <div class="min-w-0 flex-1">
        <HillChart
          v-if="project"
          :markers="markers"
          clickable
          @move="onMove"
          @click="onTrackableClick"
        />
      </div>
      <SidePanel
        v-if="project && selectedTrackableId"
        :project="project"
        :trackable-id="selectedTrackableId"
        @close="selectedTrackableId = null"
      />
    </div>
  </section>
</template>
