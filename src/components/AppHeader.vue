<script setup lang="ts"></script>

<template>
  <header class="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
    <RouterLink to="/" class="font-heading text-xl">Salita</RouterLink>
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled
        class="cursor-not-allowed rounded-full bg-hill-sand px-4 py-2 text-sm text-text-warm/50"
      >
        Import
      </button>
      <button
        type="button"
        disabled
        class="cursor-not-allowed rounded-full bg-hill-sand px-4 py-2 text-sm text-text-warm/50"
      >
        Export
      </button>
      <button
        type="button"
        disabled
        class="cursor-not-allowed rounded-full bg-hill-sand px-4 py-2 text-sm text-text-warm/50"
      >
        Clean
      </button>
      <button
        type="button"
        disabled
        class="cursor-not-allowed rounded-full bg-hill-sand px-4 py-2 text-sm text-text-warm/50"
      >
        + Project
      </button>
      <button
        type="button"
        disabled
        class="cursor-not-allowed rounded-full bg-hill-sand px-4 py-2 text-sm text-text-warm/50"
      >
        End daily
      </button>
    </div>
  </header>
</template>
