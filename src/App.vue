<script setup lang="ts">
import { onMounted, ref } from "vue";
import CreateView from "./views/CreateView.vue";
import LibraryView from "./views/LibraryView.vue";
import TemplatesView from "./views/TemplatesView.vue";
import ToastFlash from "./components/ToastFlash.vue";
import SettingsModal from "./components/SettingsModal.vue";
import { useEditorStore } from "./stores/editor";
import { useSettingsStore } from "./stores/settings";
import { isValidStyle } from "./lib/validate-style";

const view = ref<"create" | "library" | "templates">("create");
const showSettings = ref(false);
const NAV = [
  { id: "create", label: "Create" },
  { id: "library", label: "Library" },
  { id: "templates", label: "Templates" },
] as const;

const editor = useEditorStore();
const settings = useSettingsStore();
onMounted(async () => {
  const s = await settings.init();
  if (isValidStyle(s.lastStyle)) {
    editor.applyStyle(s.lastStyle);
  }
});
</script>

<template>
  <div class="flex h-screen flex-col bg-gray-50 text-gray-900 dark:bg-[#202020] dark:text-gray-100">
    <header data-tauri-drag-region class="flex h-12 shrink-0 items-center gap-1 bg-gray-50 pl-20 pr-3 dark:bg-[#202020]">
      <button class="mr-2 text-sm font-bold tracking-tight" @click="view = 'create'">Glyphic</button>
      <button v-for="n in NAV" :key="n.id"
        class="rounded px-3 py-1.5 text-sm"
        :class="view === n.id ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
        @click="view = n.id">
        {{ n.label }}
      </button>
      <div data-tauri-drag-region class="flex-1"></div>
      <button class="rounded p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800" aria-label="Settings" title="Settings"
        @click="showSettings = true">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.08a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </header>
    <main class="h-[calc(100vh-3rem)] overflow-hidden">
      <CreateView v-if="view === 'create'" />
      <LibraryView v-else-if="view === 'library'" @edit="view = 'create'" />
      <TemplatesView v-else @edit="view = 'create'" />
    </main>
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
    <ToastFlash />
  </div>
</template>
