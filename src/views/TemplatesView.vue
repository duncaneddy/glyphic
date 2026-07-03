<script setup lang="ts">
import { onMounted, ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { useLibraryStore } from "../stores/library";
import { useEditorStore } from "../stores/editor";
import { renderSvg } from "../engine/render";
import { isValidStyle } from "../lib/validate-style";
import type { QrStyle, Template } from "../engine/types";

const library = useLibraryStore();
const editor = useEditorStore();
const emit = defineEmits<{ edit: [] }>();
const renaming = ref<string | null>(null);
const renameText = ref("");
const error = ref("");

onMounted(() => library.refresh());

function swatch(style: QrStyle): string {
  try {
    return renderSvg({ content: { type: "url", url: "https://example.com" }, style }).svg;
  } catch {
    return "";
  }
}

function editInEditor(t: Template) {
  editor.applyStyle(t.style);
  editor.editingTemplateId = t.id;
  emit("edit");
}

async function commitRename(t: Template) {
  if (renameText.value.trim()) {
    try {
      await library.updateTemplate(t.id, { name: renameText.value.trim() });
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    }
  }
  renaming.value = null;
}

async function duplicate(t: Template) {
  try {
    await library.duplicateTemplate(t.id);
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function remove(t: Template) {
  try {
    await library.removeTemplate(t.id);
    if (editor.editingTemplateId === t.id) editor.editingTemplateId = null;
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function exportTemplate(t: Template) {
  error.value = "";
  try {
    const path = await save({
      defaultPath: `${t.name}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (!path) return;
    const contents = JSON.stringify(t, null, 2);
    await invoke("write_file", { path, contents: Array.from(new TextEncoder().encode(contents)) });
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function importTemplate() {
  error.value = "";
  try {
    const path = await open({ filters: [{ name: "JSON", extensions: ["json"] }] });
    if (!path || Array.isArray(path)) return;
    const text = await invoke<string>("read_text_file", { path });

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      error.value = "Not a valid Glyphic template file.";
      return;
    }

    const style = (parsed as { style?: unknown } | null)?.style;
    if (!isValidStyle(style)) {
      error.value = "Not a valid Glyphic template file.";
      return;
    }

    const rawName = (parsed as { name?: unknown }).name;
    let name = typeof rawName === "string" && rawName.trim() ? rawName.trim() : "Imported template";
    if (library.templates.some((existing) => existing.name === name)) name = `${name} (imported)`;
    await library.saveNewTemplate(name, style);
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}
</script>

<template>
  <div class="h-full overflow-y-auto p-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-lg font-semibold">Templates</h1>
      <button class="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
        @click="importTemplate">Import…</button>
    </div>
    <p v-if="error" class="text-xs text-red-500 mb-2">{{ error }}</p>
    <p v-if="!library.templates.length" class="text-sm text-gray-400">
      Save a style from the editor to reuse it here.
    </p>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
      <div v-for="t in library.templates" :key="t.id" class="rounded-lg border border-gray-200 bg-white p-3">
        <div class="mb-2 aspect-square [&>svg]:h-full [&>svg]:w-full" v-html="swatch(t.style)" />
        <input v-if="renaming === t.id" v-model="renameText" class="w-full rounded border px-1 text-sm"
          @keydown.enter="commitRename(t)" @blur="commitRename(t)" />
        <p v-else class="truncate text-sm font-medium" :title="t.name"
          @dblclick="renaming = t.id; renameText = t.name">{{ t.name }}</p>
        <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <button class="text-blue-600 hover:underline" @click="editInEditor(t)">Edit</button>
          <button class="text-blue-600 hover:underline"
            @click="renaming = t.id; renameText = t.name">Rename</button>
          <button class="text-blue-600 hover:underline" @click="duplicate(t)">Duplicate</button>
          <button class="text-blue-600 hover:underline" @click="exportTemplate(t)">Export</button>
        </div>
        <div class="mt-2 flex justify-end text-xs">
          <button class="text-red-500 hover:underline" @click="remove(t)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
