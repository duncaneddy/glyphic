<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useLibraryStore } from "../stores/library";
import { useEditorStore } from "../stores/editor";
import type { HistoryEntry, QrConfig } from "../engine/types";
import { copyEpsToClipboard, copyPngToClipboard, copySvgToClipboard, exportAs, type ExportFormat } from "../lib/exporter";

const library = useLibraryStore();
const editor = useEditorStore();
const emit = defineEmits<{ edit: [] }>();
const error = ref("");
const feedback = ref<{ id: string; text: string } | null>(null);
let feedbackTimer: ReturnType<typeof setTimeout> | undefined;
const FORMATS: ExportFormat[] = ["svg", "png", "jpeg", "webp", "pdf", "eps"];
const formats = reactive<Record<string, ExportFormat>>({});
const btnClass = "rounded border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-100";
const deleteBtnClass = "rounded border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50";

function showFeedback(id: string, text: string) {
  feedback.value = { id, text };
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    feedback.value = null;
  }, 2000);
}

onMounted(() => library.refresh());

function formatFor(id: string): ExportFormat {
  return formats[id] ?? "svg";
}
function setFormat(id: string, format: ExportFormat) {
  formats[id] = format;
}

function openInEditor(entry: HistoryEntry) {
  editor.loadConfig(entry.config as QrConfig);
  editor.editingTemplateId = null;
  emit("edit");
}

async function save(entry: HistoryEntry) {
  error.value = "";
  if (!entry.previewSvg) {
    error.value = "No preview available for this entry.";
    return;
  }
  try {
    const name = entry.name.replace(/[^a-zA-Z0-9.-]+/g, "-").slice(0, 40);
    const path = await exportAs(entry.previewSvg, formatFor(entry.id), 1024, name);
    if (path !== null) showFeedback(entry.id, "Saved ✓");
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function copy(entry: HistoryEntry) {
  error.value = "";
  if (!entry.previewSvg) {
    error.value = "No preview available for this entry.";
    return;
  }
  const format = formatFor(entry.id);
  if (format === "pdf") return;
  try {
    if (format === "svg") await copySvgToClipboard(entry.previewSvg);
    else if (format === "eps") await copyEpsToClipboard(entry.previewSvg);
    else {
      // The OS clipboard only holds bitmaps, and Image.fromBytes only decodes PNG,
      // so jpeg/webp selections are copied as PNG bitmaps too — don't claim otherwise.
      await copyPngToClipboard(entry.previewSvg, 1024);
    }
    showFeedback(entry.id, "Copied ✓");
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
    <div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
      <div v-for="entry in library.history" :key="entry.id"
        class="relative rounded-lg border border-gray-200 bg-white p-4">
        <div class="mb-2 aspect-square [&>svg]:h-full [&>svg]:w-full" v-html="entry.previewSvg" />
        <p class="truncate text-sm font-medium" :title="entry.name">{{ entry.name }}</p>
        <p class="text-xs text-gray-400">{{ new Date(entry.createdAt).toLocaleString() }}</p>
        <span v-if="feedback?.id === entry.id" class="absolute right-4 top-4 text-xs text-green-600">{{ feedback.text }}</span>
        <div class="mt-2 flex items-center gap-2 text-xs">
          <select class="flex-1 min-w-0 rounded border border-gray-300 px-2.5 py-1 text-xs"
            :value="formatFor(entry.id)"
            @change="setFormat(entry.id, ($event.target as HTMLSelectElement).value as ExportFormat)">
            <option v-for="fmt in FORMATS" :key="fmt" :value="fmt">{{ fmt.toUpperCase() }}</option>
          </select>
          <button :class="btnClass" class="shrink-0" @click="save(entry)">Save</button>
          <button :class="btnClass" class="shrink-0 disabled:pointer-events-none disabled:text-gray-300"
            :disabled="formatFor(entry.id) === 'pdf'"
            :title="formatFor(entry.id) === 'pdf' ? `PDF can't go to the clipboard — use Save` : undefined"
            @click="copy(entry)">Copy</button>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs">
          <button :class="btnClass" @click="openInEditor(entry)">Edit</button>
          <button :class="deleteBtnClass" @click="remove(entry)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
