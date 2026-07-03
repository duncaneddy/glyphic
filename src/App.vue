<script setup lang="ts">
import { onMounted, ref } from "vue";
import CreateView from "./views/CreateView.vue";
import LibraryView from "./views/LibraryView.vue";
import TemplatesView from "./views/TemplatesView.vue";
import { getSettings } from "./lib/ipc";
import { useEditorStore } from "./stores/editor";
import { BODY_SHAPES, EYE_BALL_SHAPES, EYE_FRAME_SHAPES } from "./engine/types";

const view = ref<"create" | "library" | "templates">("create");
const NAV = [
  { id: "create", label: "Create" },
  { id: "library", label: "Library" },
  { id: "templates", label: "Templates" },
] as const;

const editor = useEditorStore();
onMounted(async () => {
  try {
    const s = await getSettings();
    const style = s.lastStyle;
    if (
      style &&
      BODY_SHAPES.includes(style.bodyShape) &&
      EYE_FRAME_SHAPES.includes(style.eyeFrameShape) &&
      EYE_BALL_SHAPES.includes(style.eyeBallShape)
    ) {
      editor.applyStyle(style);
    }
  } catch {
    /* first launch or missing backend — keep defaults */
  }
});
</script>

<template>
  <div class="flex h-screen flex-col bg-gray-50 text-gray-900">
    <header data-tauri-drag-region class="flex h-12 shrink-0 items-center gap-1 border-b border-gray-200 bg-gray-50 pl-20 pr-3">
      <p class="mr-2 text-sm font-bold tracking-tight">Glyphic</p>
      <button v-for="n in NAV" :key="n.id"
        class="rounded px-3 py-1.5 text-sm"
        :class="view === n.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'"
        @click="view = n.id">
        {{ n.label }}
      </button>
      <div data-tauri-drag-region class="flex-1"></div>
    </header>
    <main class="h-[calc(100vh-3rem)] overflow-hidden">
      <CreateView v-if="view === 'create'" />
      <LibraryView v-else-if="view === 'library'" @edit="view = 'create'" />
      <TemplatesView v-else @edit="view = 'create'" />
    </main>
  </div>
</template>
