<script setup lang="ts">
import { onMounted, ref } from "vue";
import SectionCard from "./SectionCard.vue";
import { useEditorStore } from "../stores/editor";
import { useLibraryStore } from "../stores/library";

const editor = useEditorStore();
const library = useLibraryStore();
const naming = ref(false);
const newName = ref("");
const error = ref("");

onMounted(() => library.refresh());

function apply(id: string) {
  const t = library.templates.find((t) => t.id === id);
  if (t) editor.applyStyle(t.style);
  if (editor.editingTemplateId && editor.editingTemplateId !== id) editor.editingTemplateId = null;
}

async function saveNew() {
  if (!newName.value.trim()) return;
  try {
    await library.saveNewTemplate(newName.value.trim(), JSON.parse(JSON.stringify(editor.config.style)));
    naming.value = false;
    newName.value = "";
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function updateCurrent() {
  if (!editor.editingTemplateId) return;
  try {
    await library.updateTemplate(editor.editingTemplateId, {
      style: JSON.parse(JSON.stringify(editor.config.style)),
    });
    editor.editingTemplateId = null;
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}
</script>

<template>
  <SectionCard title="Template">
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <div class="flex items-center gap-2 text-sm">
      <select class="flex-1 rounded border border-gray-300 px-2 py-1.5 dark:border-[#4a4a4a] dark:bg-[#333333] dark:text-neutral-100"
        @change="apply(($event.target as HTMLSelectElement).value)">
        <option value="" disabled selected>Apply a template…</option>
        <option v-for="t in library.templates" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <button v-if="editor.editingTemplateId"
        class="rounded bg-gray-900 px-3 py-1.5 text-white dark:bg-neutral-100 dark:text-neutral-900" @click="updateCurrent">
        Update template
      </button>
      <button v-else class="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-100 dark:border-[#4a4a4a] dark:hover:bg-[#333333]"
        @click="naming = true">
        Save style…
      </button>
    </div>
    <div v-if="naming" class="flex gap-2 text-sm">
      <input v-model="newName" placeholder="Template name" class="flex-1 rounded border border-gray-300 px-2 py-1.5 dark:border-[#4a4a4a] dark:bg-[#333333] dark:text-neutral-100"
        @keydown.enter="saveNew" />
      <button class="rounded bg-gray-900 px-3 py-1.5 text-white dark:bg-neutral-100 dark:text-neutral-900" @click="saveNew">Save</button>
      <button class="rounded border border-gray-300 px-3 py-1.5 dark:border-[#4a4a4a]" @click="naming = false">Cancel</button>
    </div>
  </SectionCard>
</template>
