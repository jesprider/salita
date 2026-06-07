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

function onAddTask() {
  const id = store.addTask(props.id)
  if (id) selectedTrackableId.value = id
}
</script>

<template>
  <header v-if="project" class="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
    <div>
      <RouterLink to="/projects" class="text-sm text-text-warm/80 hover:text-text-warm">
        ← Overview
      </RouterLink>
      <h1 class="mt-1 font-heading text-3xl">{{ project.name }}</h1>
    </div>
    <button
      type="button"
      class="rounded-full bg-terracotta px-4 py-2 text-sm text-cream transition-opacity hover:opacity-90"
      @click="onAddTask"
    >
      + Task
    </button>
  </header>
  <section class="px-6 pb-6">
    <div class="mx-auto flex max-w-[1400px] items-start gap-6">
      <div class="min-w-0 flex-1">
        <HillChart
          v-if="project"
          :markers="markers"
          :selected-id="selectedTrackableId"
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
