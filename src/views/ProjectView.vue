<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHillChartStore } from '../stores/hillChart'
import { projectDotViews } from '../composables/dotViews'
import HillChart from '../components/HillChart.vue'
import SidePanel from '../components/SidePanel.vue'

const props = defineProps<{ id: string }>()

const store = useHillChartStore()
const router = useRouter()
const { projects } = storeToRefs(store)
const selectedDotId = ref<string | null>(null)

const project = computed(() => projects.value.find((p) => p.id === props.id))
const dots = computed(() => (project.value ? projectDotViews(project.value) : []))

watchEffect(() => {
  if (!project.value) router.replace('/projects')
})

watchEffect(() => {
  if (!project.value || !selectedDotId.value) return
  const ids = dots.value.map((d) => d.id)
  if (!ids.includes(selectedDotId.value)) {
    selectedDotId.value = null
  }
})

function onMove(id: string, position: number) {
  store.setPosition(id, position)
}

function onDotClick(id: string) {
  selectedDotId.value = selectedDotId.value === id ? null : id
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
          :dots="dots"
          clickable
          @move="onMove"
          @click="onDotClick"
        />
      </div>
      <SidePanel
        v-if="project && selectedDotId"
        :project="project"
        :dot-id="selectedDotId"
        @close="selectedDotId = null"
      />
    </div>
  </section>
</template>
