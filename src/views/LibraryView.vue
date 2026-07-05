<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useLibraryStore } from "../stores/library";
import { useEditorStore } from "../stores/editor";
import { useSettingsStore } from "../stores/settings";
import type { ContentType, HistoryEntry, QrConfig } from "../engine/types";
import { copyEpsToClipboard, copyPngToClipboard, copySvgToClipboard, exportAs, type ExportFormat } from "../lib/exporter";
import { showToast } from "../lib/toast";
import { CONTENT_KIND_LABELS, HISTORY_SORT_LABELS, queryHistory, type HistorySort } from "../lib/library-query";

const library = useLibraryStore();
const editor = useEditorStore();
const settings = useSettingsStore();
const emit = defineEmits<{ edit: [] }>();
const error = ref("");
const FORMATS: ExportFormat[] = ["svg", "png", "jpeg", "webp", "pdf", "eps"];
const formats = reactive<Record<string, ExportFormat>>({});
const btnClass = "rounded border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-100 dark:border-[#4a4a4a] dark:hover:bg-[#333333]";
const deleteBtnClass = "rounded border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950";
const controlClass = "rounded border border-gray-300 px-2.5 py-1.5 text-sm dark:border-[#4a4a4a] dark:bg-[#333333] dark:text-neutral-100";

const search = ref("");
const kind = ref<ContentType | "all">("all");
const sort = ref<HistorySort>("newest");
const visibleHistory = computed(() =>
  queryHistory(library.history, { search: search.value, kind: kind.value, sort: sort.value }));

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
    if (path !== null) showToast("Saved");
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
    showToast("Copied to clipboard");
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
    <div v-if="library.history.length" class="mb-4 flex flex-wrap items-center gap-2">
      <input v-model="search" type="search" placeholder="Search codes…"
        :class="controlClass" class="min-w-0 flex-1 basis-40" />
      <select v-model="kind" :class="controlClass" aria-label="Filter by kind">
        <option value="all">All kinds</option>
        <option v-for="(label, value) in CONTENT_KIND_LABELS" :key="value" :value="value">{{ label }}</option>
      </select>
      <select v-model="sort" :class="controlClass" aria-label="Sort by">
        <option v-for="(label, value) in HISTORY_SORT_LABELS" :key="value" :value="value">{{ label }}</option>
      </select>
    </div>
    <p v-if="error" class="text-xs text-red-500 mb-2">{{ error }}</p>
    <p v-if="!library.history.length" class="text-sm text-gray-400 dark:text-neutral-500">
      Codes you export or copy are saved here automatically.
    </p>
    <p v-else-if="!visibleHistory.length" class="text-sm text-gray-400 dark:text-neutral-500">
      No codes match your search or filters.
    </p>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
      <div v-for="entry in visibleHistory" :key="entry.id"
        class="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-[#3a3a3a] dark:bg-[#2a2a2a]">
        <div class="mb-2 aspect-square rounded [&>svg]:h-full [&>svg]:w-full"
          :style="settings.surfaceStyle(entry.config.style.background)" v-html="entry.previewSvg" />
        <p class="truncate text-sm font-medium" :title="entry.name">{{ entry.name }}</p>
        <p class="text-xs text-gray-400 dark:text-neutral-500">{{ new Date(entry.createdAt).toLocaleString() }}</p>
        <div class="mt-2 flex items-center gap-2 text-xs">
          <select class="flex-1 min-w-0 rounded border border-gray-300 px-2.5 py-1 text-xs dark:border-[#4a4a4a] dark:bg-[#333333] dark:text-neutral-100"
            :value="formatFor(entry.id)"
            @change="setFormat(entry.id, ($event.target as HTMLSelectElement).value as ExportFormat)">
            <option v-for="fmt in FORMATS" :key="fmt" :value="fmt">{{ fmt.toUpperCase() }}</option>
          </select>
          <button :class="btnClass" class="shrink-0" @click="save(entry)">Save</button>
          <button :class="btnClass" class="shrink-0 disabled:pointer-events-none disabled:text-gray-300 dark:disabled:text-neutral-600"
            :disabled="formatFor(entry.id) === 'pdf'"
            :title="formatFor(entry.id) === 'pdf' ? `PDF can't go to the clipboard — use Save` : undefined"
            @click="copy(entry)">Copy</button>
        </div>
        <div class="mt-2 grid grid-cols-2 gap-1.5 text-xs">
          <button :class="[btnClass, 'w-full']" @click="openInEditor(entry)">Edit</button>
          <button :class="[deleteBtnClass, 'w-full']" @click="remove(entry)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
