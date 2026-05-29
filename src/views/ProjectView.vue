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
  <section class="px-6 py-6">
    <div class="mx-auto max-w-[1200px]">
      <RouterLink to="/projects" class="text-sm">← Overview</RouterLink>
      <h1 v-if="project" class="mt-2 mb-2 font-heading text-3xl">{{ project.name }}</h1>
      <HillChart v-if="project" :dots="dots" @move="onMove" />
    </div>
  </section>
</template>
