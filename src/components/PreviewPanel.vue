<script setup lang="ts">
import { computed, ref } from "vue";
import { useEditorStore } from "../stores/editor";
import { useLibraryStore } from "../stores/library";
import { copyEpsToClipboard, copyPngToClipboard, copySvgToClipboard, exportAs, type ExportFormat } from "../lib/exporter";
import { setSettings } from "../lib/ipc";

const editor = useEditorStore();
const library = useLibraryStore();
const SIZES = [256, 512, 1024, 2048, 4096];
const FORMATS: ExportFormat[] = ["svg", "png", "jpeg", "webp", "pdf", "eps"];
const format = ref<ExportFormat>("png");
const status = ref("");

const showRasterSize = computed(() => format.value === "png" || format.value === "jpeg" || format.value === "webp");

function suggestedName(): string {
  const c = editor.config.content;
  const base =
    c.type === "url" ? c.url.replace(/^https?:\/\//, "").split(/[/?#]/)[0] || "qr" : `qr-${c.type}`;
  return base.replace(/[^a-zA-Z0-9.-]+/g, "-").slice(0, 40);
}

async function recordSuccess(svg: string) {
  try {
    await library.recordHistory(JSON.parse(JSON.stringify(editor.config)), svg);
    await setSettings({ lastStyle: JSON.parse(JSON.stringify(editor.config.style)) });
  } catch {
    status.value += " (couldn't save to library)";
  }
}

async function doSave() {
  const svg = editor.rendered.result?.svg;
  if (!svg) return;
  status.value = "";
  try {
    const path = await exportAs(svg, format.value, editor.exportSize, suggestedName());
    if (path) {
      status.value = `Saved ${format.value.toUpperCase()}`;
      await recordSuccess(svg);
    }
  } catch (e) {
    status.value = e instanceof Error ? e.message : String(e);
  }
}

async function doCopy() {
  const svg = editor.rendered.result?.svg;
  if (!svg || format.value === "pdf") return;
  status.value = "";
  try {
    if (format.value === "svg") {
      await copySvgToClipboard(svg);
      status.value = "Copied SVG to clipboard";
    } else if (format.value === "eps") {
      await copyEpsToClipboard(svg);
      status.value = "Copied EPS to clipboard";
    } else {
      // The OS clipboard only holds bitmaps, and Image.fromBytes only decodes PNG,
      // so jpeg/webp selections are copied as PNG bitmaps too — don't claim otherwise.
      await copyPngToClipboard(svg, editor.exportSize);
      status.value = "Copied image to clipboard";
    }
    await recordSuccess(svg);
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

    <div class="flex items-center gap-2 text-sm">
      <label class="flex items-center gap-2 text-gray-600">
        Format:
        <select v-model="format" class="rounded border border-gray-300 px-2 py-1">
          <option v-for="fmt in FORMATS" :key="fmt" :value="fmt">{{ fmt.toUpperCase() }}</option>
        </select>
      </label>
      <label v-if="showRasterSize" class="flex items-center gap-2 text-gray-600">
        Size:
        <select v-model.number="editor.exportSize" class="rounded border border-gray-300 px-2 py-1">
          <option v-for="s in SIZES" :key="s" :value="s">{{ s }} px</option>
        </select>
      </label>
    </div>

    <div class="flex gap-2">
      <button class="rounded border border-gray-400 px-3 py-1.5 text-sm hover:bg-gray-100"
        :disabled="!editor.rendered.result" @click="doSave">Save</button>
      <button class="rounded border border-gray-400 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:text-gray-300"
        :disabled="!editor.rendered.result || format === 'pdf'"
        :title="format === 'pdf' ? `PDF can't go to the clipboard — use Save` : undefined"
        @click="doCopy">Copy</button>
    </div>
    <p v-if="status" class="text-xs text-gray-500">{{ status }}</p>
  </div>
</template>
