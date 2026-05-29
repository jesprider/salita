<script setup lang="ts"></script>

<template>
  <div class="min-h-screen font-body">
    <header class="flex items-center gap-4 px-6 py-4">
      <RouterLink to="/" class="font-heading text-xl">Salita</RouterLink>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
