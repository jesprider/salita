<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <section class="px-6 py-12">
    <RouterLink to="/projects" class="text-sm">← Back to overview</RouterLink>
    <h1 class="mt-4 font-heading text-3xl">Project {{ id }}</h1>
    <p class="mt-2 text-force-past">Project detail view — coming in a later iteration.</p>
  </section>
</template>
