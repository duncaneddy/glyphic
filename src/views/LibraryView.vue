<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useLibraryStore } from "../stores/library";
import { useEditorStore } from "../stores/editor";
import type { HistoryEntry, QrConfig } from "../engine/types";
import { copyPngToClipboard } from "../lib/exporter";

const library = useLibraryStore();
const editor = useEditorStore();
const emit = defineEmits<{ edit: [] }>();
const error = ref("");

onMounted(() => library.refresh());

function openInEditor(entry: HistoryEntry) {
  editor.loadConfig(entry.config as QrConfig);
  editor.editingTemplateId = null;
  emit("edit");
}

async function copy(entry: HistoryEntry) {
  try {
    if (entry.previewSvg) await copyPngToClipboard(entry.previewSvg, 1024);
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function remove(entry: HistoryEntry) {
  try {
    await library.removeHistory(entry.id);
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}
</script>

<template>
  <div class="h-full overflow-y-auto p-6">
    <h1 class="mb-4 text-lg font-semibold">Library</h1>
    <p v-if="error" class="text-xs text-red-500 mb-2">{{ error }}</p>
    <p v-if="!library.history.length" class="text-sm text-gray-400">
      Codes you export or copy are saved here automatically.
    </p>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
      <div v-for="entry in library.history" :key="entry.id"
        class="rounded-lg border border-gray-200 bg-white p-3">
        <div class="mb-2 aspect-square [&>svg]:h-full [&>svg]:w-full" v-html="entry.previewSvg" />
        <p class="truncate text-sm font-medium" :title="entry.name">{{ entry.name }}</p>
        <p class="text-xs text-gray-400">{{ new Date(entry.createdAt).toLocaleString() }}</p>
        <div class="mt-2 flex gap-2 text-xs">
          <button class="text-blue-600 hover:underline" @click="openInEditor(entry)">Edit</button>
          <button class="text-blue-600 hover:underline" @click="copy(entry)">Copy PNG</button>
          <button class="ml-auto text-red-500 hover:underline"
            @click="remove(entry)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
