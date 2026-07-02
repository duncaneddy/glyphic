<script setup lang="ts">
import { ref } from "vue";
import CreateView from "./views/CreateView.vue";

const view = ref<"create" | "library" | "templates">("create");
const NAV = [
  { id: "create", label: "Create" },
  { id: "library", label: "Library" },
  { id: "templates", label: "Templates" },
] as const;
</script>

<template>
  <div class="flex h-screen bg-gray-50 text-gray-900">
    <nav class="flex w-40 shrink-0 flex-col gap-1 border-r border-gray-200 bg-white p-3">
      <p class="mb-2 px-2 text-lg font-bold tracking-tight">Glyphic</p>
      <button v-for="n in NAV" :key="n.id"
        class="rounded px-3 py-2 text-left text-sm"
        :class="view === n.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'"
        @click="view = n.id">
        {{ n.label }}
      </button>
    </nav>
    <main class="flex-1 overflow-hidden">
      <CreateView v-if="view === 'create'" />
      <div v-else-if="view === 'library'" class="p-6 text-gray-400">Library — coming in Task 15</div>
      <div v-else class="p-6 text-gray-400">Templates — coming in Task 16</div>
    </main>
  </div>
</template>
