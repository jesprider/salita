<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ForceDirection, Project } from '../schema/types'
import { forcesByStatus, lookupInProject } from '../composables/trackableLookup'
import { useHillChartStore } from '../stores/hillChart'
import ForceAddForm from './ForceAddForm.vue'
import ForceChip from './ForceChip.vue'

const props = defineProps<{
  project: Project
  trackableId: string
}>()

defineEmits<{
  (e: 'close'): void
}>()

const store = useHillChartStore()
const editingForceId = ref<string | null>(null)
const addingDirection = ref<ForceDirection | null>(null)

watch(
  () => props.trackableId,
  () => {
    editingForceId.value = null
    addingDirection.value = null
  },
)

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

function startEdit(forceId: string) {
  addingDirection.value = null
  editingForceId.value = forceId
}

function cancelEdit() {
  editingForceId.value = null
}

function onSaveEdit(forceId: string, payload: { label: string; owner: string | null }) {
  store.updateForce(props.trackableId, forceId, payload)
  editingForceId.value = null
}

function onResolve(forceId: string) {
  store.resolveForce(props.trackableId, forceId)
}

function onUnresolve(forceId: string) {
  store.unresolveForce(props.trackableId, forceId)
}

function startAdd(direction: ForceDirection) {
  editingForceId.value = null
  addingDirection.value = direction
}

function cancelAdd() {
  addingDirection.value = null
}

function onAddSave(direction: ForceDirection, payload: { label: string; owner: string | null }) {
  store.addForce(props.trackableId, direction, payload.label, payload.owner)
  addingDirection.value = null
}
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
        <span class="mt-2 inline-block rounded-full bg-hill-sand px-2.5 py-0.5 text-xs capitalize">
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
        {{ trackable.source.system ? `${trackable.source.system}:` : ''
        }}{{ trackable.source.id ?? trackable.source.url }}
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
      <ul class="space-y-2">
        <ForceChip
          v-for="force in activeUp"
          :key="force.id"
          :force="force"
          variant="active"
          :is-editing="editingForceId === force.id"
          @edit-start="startEdit(force.id)"
          @save="onSaveEdit(force.id, $event)"
          @cancel="cancelEdit"
          @resolve="onResolve(force.id)"
        />
        <ForceAddForm
          v-if="addingDirection === 'up'"
          @save="onAddSave('up', $event)"
          @cancel="cancelAdd"
        />
      </ul>
      <p v-if="!activeUp.length && addingDirection !== 'up'" class="mb-2 text-sm text-text-warm/50">
        None
      </p>
      <button
        v-if="addingDirection !== 'up'"
        type="button"
        class="mt-2 text-sm text-terracotta hover:underline"
        aria-label="Add up force"
        @click="startAdd('up')"
      >
        + Up force
      </button>
    </section>

    <section class="mb-6">
      <h3 class="mb-2 text-xs font-medium tracking-wide text-text-warm/60 uppercase">
        Active down forces
      </h3>
      <ul class="space-y-2">
        <ForceChip
          v-for="force in activeDown"
          :key="force.id"
          :force="force"
          variant="active"
          :is-editing="editingForceId === force.id"
          @edit-start="startEdit(force.id)"
          @save="onSaveEdit(force.id, $event)"
          @cancel="cancelEdit"
          @resolve="onResolve(force.id)"
        />
        <ForceAddForm
          v-if="addingDirection === 'down'"
          @save="onAddSave('down', $event)"
          @cancel="cancelAdd"
        />
      </ul>
      <p
        v-if="!activeDown.length && addingDirection !== 'down'"
        class="mb-2 text-sm text-text-warm/50"
      >
        None
      </p>
      <button
        v-if="addingDirection !== 'down'"
        type="button"
        class="mt-2 text-sm text-terracotta hover:underline"
        aria-label="Add down force"
        @click="startAdd('down')"
      >
        + Down force
      </button>
    </section>

    <details v-if="pastUp.length" class="mb-4">
      <summary class="cursor-pointer text-sm font-medium">Past boosters</summary>
      <ul class="mt-2 space-y-2">
        <ForceChip
          v-for="force in pastUp"
          :key="force.id"
          :force="force"
          variant="past"
          :is-editing="false"
          @unresolve="onUnresolve(force.id)"
        />
      </ul>
    </details>

    <details v-if="pastDown.length">
      <summary class="cursor-pointer text-sm font-medium">Past blockers</summary>
      <ul class="mt-2 space-y-2">
        <ForceChip
          v-for="force in pastDown"
          :key="force.id"
          :force="force"
          variant="past"
          :is-editing="false"
          @unresolve="onUnresolve(force.id)"
        />
      </ul>
    </details>
  </aside>
</template>
