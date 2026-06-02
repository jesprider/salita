<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHillChartStore } from '../stores/hillChart'
import { projectDotViews } from '../composables/dotViews'
import HillChart from '../components/HillChart.vue'

const props = defineProps<{ id: string }>()

const store = useHillChartStore()
const router = useRouter()
const { projects } = storeToRefs(store)

const project = computed(() => projects.value.find((p) => p.id === props.id))
const dots = computed(() => (project.value ? projectDotViews(project.value) : []))

watchEffect(() => {
  if (!project.value) router.replace('/projects')
})

function onMove(id: string, position: number) {
  store.setPosition(id, position)
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
    <div class="mx-auto max-w-[1200px]">
      <HillChart v-if="project" :dots="dots" @move="onMove" />
    </div>
  </section>
</template>
