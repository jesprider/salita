<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '../schema/types'
import { forcesByStatus, lookupInProject } from '../composables/trackableLookup'

const props = defineProps<{
  project: Project
  trackableId: string
}>()

defineEmits<{
  (e: 'close'): void
}>()

const lookup = computed(() => lookupInProject(props.project, props.trackableId))
const trackable = computed(() => lookup.value?.trackable ?? null)
const kind = computed(() => lookup.value?.kind ?? null)

const activeUp = computed(() =>
  trackable.value ? forcesByStatus(trackable.value.forces, 'up', 'active') : [],
)
const activeDown = computed(() =>
  trackable.value ? forcesByStatus(trackable.value.forces, 'down', 'active') : [],
)
const pastUp = computed(() =>
  trackable.value ? forcesByStatus(trackable.value.forces, 'up', 'resolved') : [],
)
const pastDown = computed(() =>
  trackable.value ? forcesByStatus(trackable.value.forces, 'down', 'resolved') : [],
)

const atPeak = computed(() => trackable.value?.position === 50)
</script>

<template>
  <aside
    v-if="trackable"
    class="w-80 shrink-0 rounded-2xl bg-cream p-5 shadow-sm ring-1 ring-hill-sand/60"
    aria-label="Work item details"
  >
    <div class="mb-6 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="font-heading text-xl leading-tight">{{ trackable.name }}</h2>
        <span
          class="mt-2 inline-block rounded-full bg-hill-sand px-2.5 py-0.5 text-xs capitalize"
        >
          {{ kind }}
        </span>
      </div>
      <button
        type="button"
        class="rounded-full px-2 py-1 text-sm text-text-warm/60 hover:bg-hill-sand hover:text-text-warm"
        aria-label="Close panel"
        @click="$emit('close')"
      >
        ✕
      </button>
    </div>

    <p v-if="trackable.source?.url" class="mb-6 text-sm">
      <a
        :href="trackable.source.url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-terracotta underline-offset-2 hover:underline"
      >
        {{ trackable.source.system ? `${trackable.source.system}:` : '' }}{{ trackable.source.id ?? trackable.source.url }}
      </a>
    </p>

    <section class="mb-6">
      <h3 class="mb-2 text-xs font-medium tracking-wide text-text-warm/60 uppercase">Position</h3>
      <p class="text-lg">{{ trackable.position }}</p>
      <p v-if="atPeak" class="mt-1 text-sm text-text-warm/70">At the peak</p>
    </section>

    <section class="mb-6">
      <h3 class="mb-2 text-xs font-medium tracking-wide text-text-warm/60 uppercase">
        Active up forces
      </h3>
      <ul v-if="activeUp.length" class="space-y-2">
        <li
          v-for="force in activeUp"
          :key="force.id"
          class="rounded-full bg-hill-sand/70 px-3 py-1.5 text-sm"
        >
          {{ force.label }}
          <span v-if="force.owner" class="text-text-warm/70"> · {{ force.owner }}</span>
          <span v-if="force.isPrimary" class="ml-1 text-xs text-text-warm/60">(primary)</span>
        </li>
      </ul>
      <p v-else class="text-sm text-text-warm/50">None</p>
    </section>

    <section class="mb-6">
      <h3 class="mb-2 text-xs font-medium tracking-wide text-text-warm/60 uppercase">
        Active down forces
      </h3>
      <ul v-if="activeDown.length" class="space-y-2">
        <li
          v-for="force in activeDown"
          :key="force.id"
          class="rounded-full bg-hill-sand/70 px-3 py-1.5 text-sm"
        >
          {{ force.label }}
          <span v-if="force.owner" class="text-text-warm/70"> · {{ force.owner }}</span>
          <span v-if="force.isPrimary" class="ml-1 text-xs text-text-warm/60">(primary)</span>
        </li>
      </ul>
      <p v-else class="text-sm text-text-warm/50">None</p>
    </section>

    <details v-if="pastUp.length" class="mb-4">
      <summary class="cursor-pointer text-sm font-medium">Past boosters</summary>
      <ul class="mt-2 space-y-2">
        <li
          v-for="force in pastUp"
          :key="force.id"
          class="rounded-full bg-hill-sand/40 px-3 py-1.5 text-sm text-text-warm/70"
        >
          {{ force.label }}
          <span v-if="force.owner"> · {{ force.owner }}</span>
        </li>
      </ul>
    </details>

    <details v-if="pastDown.length">
      <summary class="cursor-pointer text-sm font-medium">Past blockers</summary>
      <ul class="mt-2 space-y-2">
        <li
          v-for="force in pastDown"
          :key="force.id"
          class="rounded-full bg-hill-sand/40 px-3 py-1.5 text-sm text-text-warm/70"
        >
          {{ force.label }}
          <span v-if="force.owner"> · {{ force.owner }}</span>
        </li>
      </ul>
    </details>
  </aside>
</template>
