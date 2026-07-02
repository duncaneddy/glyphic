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
      <LibraryView v-else-if="view === 'library'" @edit="view = 'create'" />
      <TemplatesView v-else @edit="view = 'create'" />
    </main>
  </div>
</template>
