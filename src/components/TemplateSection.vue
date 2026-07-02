<script setup lang="ts">
import { onMounted, ref } from "vue";
import SectionCard from "./SectionCard.vue";
import { useEditorStore } from "../stores/editor";
import { useLibraryStore } from "../stores/library";

const editor = useEditorStore();
const library = useLibraryStore();
const naming = ref(false);
const newName = ref("");

onMounted(() => library.refresh());

function apply(id: string) {
  const t = library.templates.find((t) => t.id === id);
  if (t) editor.applyStyle(t.style);
  if (editor.editingTemplateId && editor.editingTemplateId !== id) editor.editingTemplateId = null;
}

async function saveNew() {
  if (!newName.value.trim()) return;
  await library.saveNewTemplate(newName.value.trim(), JSON.parse(JSON.stringify(editor.config.style)));
  naming.value = false;
  newName.value = "";
}

async function updateCurrent() {
  if (!editor.editingTemplateId) return;
  await library.updateTemplate(editor.editingTemplateId, {
    style: JSON.parse(JSON.stringify(editor.config.style)),
  });
  editor.editingTemplateId = null;
}
</script>

<template>
  <SectionCard title="Template">
    <div class="flex items-center gap-2 text-sm">
      <select class="flex-1 rounded border border-gray-300 px-2 py-1.5"
        @change="apply(($event.target as HTMLSelectElement).value)">
        <option value="" disabled selected>Apply a template…</option>
        <option v-for="t in library.templates" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <button v-if="editor.editingTemplateId"
        class="rounded bg-gray-900 px-3 py-1.5 text-white" @click="updateCurrent">
        Update template
      </button>
      <button v-else class="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-100"
        @click="naming = true">
        Save style…
      </button>
    </div>
    <div v-if="naming" class="flex gap-2 text-sm">
      <input v-model="newName" placeholder="Template name" class="flex-1 rounded border border-gray-300 px-2 py-1.5"
        @keydown.enter="saveNew" />
      <button class="rounded bg-gray-900 px-3 py-1.5 text-white" @click="saveNew">Save</button>
      <button class="rounded border border-gray-300 px-3 py-1.5" @click="naming = false">Cancel</button>
    </div>
  </SectionCard>
</template>
