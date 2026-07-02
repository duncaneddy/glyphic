<script setup lang="ts">
import { ref } from "vue";
import { useEditorStore } from "../stores/editor";
import { useLibraryStore } from "../stores/library";
import { copyPngToClipboard, copySvgToClipboard, exportAs, type ExportFormat } from "../lib/exporter";
import { setSettings } from "../lib/ipc";

const editor = useEditorStore();
const library = useLibraryStore();
const SIZES = [256, 512, 1024, 2048, 4096];
const FORMATS: ExportFormat[] = ["svg", "png", "jpeg", "webp", "pdf", "eps"];
const READY: Set<ExportFormat> = new Set(["svg", "png", "jpeg", "webp", "pdf", "eps"]);
const status = ref("");

function suggestedName(): string {
  const c = editor.config.content;
  const base =
    c.type === "url" ? c.url.replace(/^https?:\/\//, "").split(/[/?#]/)[0] || "qr" : `qr-${c.type}`;
  return base.replace(/[^a-zA-Z0-9.-]+/g, "-").slice(0, 40);
}

async function doExport(format: ExportFormat) {
  const svg = editor.rendered.result?.svg;
  if (!svg) return;
  status.value = "";
  try {
    const path = await exportAs(svg, format, editor.exportSize, suggestedName());
    if (path) {
      status.value = `Saved ${format.toUpperCase()}`;
      try {
        await library.recordHistory(JSON.parse(JSON.stringify(editor.config)), svg);
        await setSettings({ lastStyle: JSON.parse(JSON.stringify(editor.config.style)) });
      } catch {
        status.value += " (couldn't save to library)";
      }
    }
  } catch (e) {
    status.value = e instanceof Error ? e.message : String(e);
  }
}

async function doCopy(kind: "png" | "svg") {
  const svg = editor.rendered.result?.svg;
  if (!svg) return;
  try {
    if (kind === "png") await copyPngToClipboard(svg, editor.exportSize);
    else await copySvgToClipboard(svg);
    status.value = `Copied ${kind.toUpperCase()} to clipboard`;
    try {
      await library.recordHistory(JSON.parse(JSON.stringify(editor.config)), svg);
      await setSettings({ lastStyle: JSON.parse(JSON.stringify(editor.config.style)) });
    } catch {
      status.value += " (couldn't save to library)";
    }
  } catch (e) {
    status.value = e instanceof Error ? e.message : String(e);
  }
}
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
      <button v-for="fmt in FORMATS" :key="fmt" :disabled="!READY.has(fmt) || !editor.rendered.result"
        class="rounded border px-3 py-1.5 text-sm"
        :class="READY.has(fmt) && editor.rendered.result
          ? 'border-gray-400 hover:bg-gray-100' : 'border-gray-200 text-gray-300'"
        @click="doExport(fmt)">
        {{ fmt.toUpperCase() }}
      </button>
    </div>
    <div class="flex gap-2">
      <button class="rounded border border-gray-400 px-3 py-1.5 text-sm hover:bg-gray-100"
        :disabled="!editor.rendered.result" @click="doCopy('png')">Copy PNG</button>
      <button class="rounded border border-gray-400 px-3 py-1.5 text-sm hover:bg-gray-100"
        :disabled="!editor.rendered.result" @click="doCopy('svg')">Copy SVG</button>
    </div>
    <p v-if="status" class="text-xs text-gray-500">{{ status }}</p>
  </div>
</template>
