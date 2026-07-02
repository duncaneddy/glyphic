<script setup lang="ts">
import { useEditorStore } from "../stores/editor";
const editor = useEditorStore();
const SIZES = [256, 512, 1024, 2048, 4096];
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="w-72 h-72 rounded-lg border border-gray-200 bg-white p-3 grid place-items-center">
      <div v-if="editor.rendered.result" class="w-full h-full [&>svg]:w-full [&>svg]:h-full"
        v-html="editor.rendered.result.svg" />
      <p v-else class="text-sm text-gray-400 text-center px-4">{{ editor.rendered.error }}</p>
    </div>

    <ul v-if="editor.rendered.result?.warnings.length" class="text-xs text-amber-600 space-y-1">
      <li v-for="w in editor.rendered.result.warnings" :key="w">⚠ {{ w }}</li>
    </ul>

    <label class="text-sm text-gray-600">
      Raster size:
      <select v-model.number="editor.exportSize" class="ml-1 rounded border border-gray-300 px-2 py-1">
        <option v-for="s in SIZES" :key="s" :value="s">{{ s }} px</option>
      </select>
    </label>

    <div class="grid grid-cols-3 gap-2" data-testid="export-buttons">
      <button v-for="fmt in ['SVG', 'PNG', 'JPEG', 'WebP', 'PDF', 'EPS']" :key="fmt" disabled
        class="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-400">
        {{ fmt }}
      </button>
    </div>
  </div>
</template>
