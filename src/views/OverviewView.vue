<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useHillChartStore } from '../stores/hillChart'
import { overviewMarkers } from '../composables/chartMarkers'
import AppHeader from '../components/AppHeader.vue'
import HillChart from '../components/HillChart.vue'
import ImportButton from '../components/ImportButton.vue'
import SidePanel from '../components/SidePanel.vue'
import { canImport } from '../schema/importRules'
import { validateHillChartJson } from '../schema/validate'

const store = useHillChartStore()
const router = useRouter()
const { projects, demo } = storeToRefs(store)
const selectedTrackableId = ref<string | null>(null)
const importButtonRef = ref<InstanceType<typeof ImportButton> | null>(null)
const importErrors = ref<string[]>([])
const isDraggingFile = ref(false)

const markers = computed(() => overviewMarkers(projects.value))

const importEnabled = computed(() =>
  canImport({
    version: store.version,
    exportedAt: store.exportedAt,
    demo: demo.value,
    projects: projects.value,
  }),
)

const showDemoLabel = computed(() => demo.value && projects.value.length > 0)
const isEmpty = computed(() => projects.value.length === 0)

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

function onAddProject() {
  const id = store.addProject()
  selectedTrackableId.value = id
}

function onImportClick() {
  importButtonRef.value?.openPicker()
}

async function handleImportFile(file: File) {
  importErrors.value = []
  if (!importEnabled.value) return

  let text: string
  try {
    text = await file.text()
  } catch {
    importErrors.value = ['Could not read the selected file.']
    return
  }

  const result = validateHillChartJson(text)
  if (!result.ok) {
    importErrors.value = result.errors
    return
  }

  if (demo.value) {
    const ok = window.confirm('Replace demo data with your imported projects?')
    if (!ok) return
  }

  store.importState(result.state)
  selectedTrackableId.value = null
}

function onDragOver(ev: DragEvent) {
  if (!importEnabled.value) return
  ev.preventDefault()
  isDraggingFile.value = true
}

function onDragLeave() {
  isDraggingFile.value = false
}

async function onDrop(ev: DragEvent) {
  isDraggingFile.value = false
  if (!importEnabled.value) return
  ev.preventDefault()
  const file = ev.dataTransfer?.files?.[0]
  if (!file) return
  if (!file.name.endsWith('.json') && file.type !== 'application/json') {
    importErrors.value = ['Please drop a .json file.']
    return
  }
  await handleImportFile(file)
}
</script>

<template>
  <AppHeader
    :import-enabled="importEnabled"
    @add-project="onAddProject"
    @import-click="onImportClick"
  />
  <ImportButton ref="importButtonRef" :enabled="importEnabled" @file-selected="handleImportFile" />

  <p v-if="showDemoLabel" class="px-6 pb-2 text-sm text-text-warm/70">
    <span class="rounded-full bg-hill-sand px-3 py-1">Demo data</span>
  </p>

  <div
    v-if="importErrors.length"
    role="alert"
    class="mx-6 mb-4 rounded-lg border border-rust/30 bg-rust/10 px-4 py-3 text-sm text-rust"
  >
    <ul class="list-disc pl-5">
      <li v-for="(err, i) in importErrors" :key="i">{{ err }}</li>
    </ul>
  </div>

  <section class="px-6 py-6">
    <div
      v-if="isEmpty"
      class="mx-auto flex max-w-lg flex-col items-center gap-6 rounded-2xl border border-dashed border-hill-sand bg-hill-sand/30 px-8 py-16 text-center"
      :class="isDraggingFile && 'ring-2 ring-terracotta/40'"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <h2 class="font-heading text-2xl">Your hill chart is empty</h2>
      <p class="text-sm text-text-warm/80">
        Import a JSON export from your tracker skill, or add a project manually.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          class="rounded-full bg-terracotta px-5 py-2.5 text-sm text-cream transition-opacity hover:opacity-90"
          @click="onImportClick"
        >
          Import JSON
        </button>
        <button
          type="button"
          class="rounded-full bg-hill-sand px-5 py-2.5 text-sm text-text-warm transition-opacity hover:opacity-90"
          @click="onAddProject"
        >
          + Add your first project
        </button>
      </div>
      <RouterLink to="/" class="text-sm text-text-warm/70 underline hover:text-text-warm">
        New here? Read what this app is →
      </RouterLink>
    </div>

    <div
      v-else
      class="mx-auto flex max-w-[1400px] items-start gap-6"
      :class="isDraggingFile && 'rounded-2xl ring-2 ring-terracotta/40'"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
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
