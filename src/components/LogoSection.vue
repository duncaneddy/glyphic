<script setup lang="ts">
import SectionCard from "./SectionCard.vue";
import { useEditorStore } from "../stores/editor";
import { buildLogoMask } from "../lib/logo-mask";

const editor = useEditorStore();

async function setLogo(src: string) {
  editor.config.style.logo = { sizeRatio: 0.2, knockout: true, ...editor.config.style.logo, src, mask: undefined };
  if (editor.config.style.ecLevel !== "H") editor.config.style.ecLevel = "H";
  try {
    const mask = await buildLogoMask(src);
    // The logo may have changed again while the mask was building; only apply if still current.
    if (editor.config.style.logo?.src === src) editor.config.style.logo.mask = mask;
  } catch {
    // soft-fail: leave mask undefined, whole-box knockout applies
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

async function onUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  await setLogo(await readAsDataUrl(file));
}
</script>

<template>
  <SectionCard title="Image">
    <div class="flex items-center gap-2">
      <label class="cursor-pointer rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100">
        Upload image…
        <input type="file" accept="image/png,image/jpeg,image/svg+xml" class="hidden" @change="onUpload" />
      </label>
      <button v-if="editor.config.style.logo" class="ml-auto text-sm text-red-500 hover:underline"
        @click="editor.config.style.logo = null">
        Remove
      </button>
    </div>

    <template v-if="editor.config.style.logo">
      <label class="flex items-center gap-2 text-sm">
        Size
        <input v-model.number="editor.config.style.logo.sizeRatio" type="range"
          min="0.1" max="0.3" step="0.01" />
        <span class="w-10 text-xs tabular-nums">{{ Math.round(editor.config.style.logo.sizeRatio * 100) }}%</span>
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input v-model="editor.config.style.logo.knockout" type="checkbox" />
        Clear modules behind logo
      </label>
    </template>

    <label class="flex items-center gap-2 border-t border-gray-100 pt-3 text-sm">
      Error correction
      <select v-model="editor.config.style.ecLevel" class="rounded border border-gray-300 px-2 py-1">
        <option value="L">L (7%)</option><option value="M">M (15%)</option>
        <option value="Q">Q (25%)</option><option value="H">H (30%)</option>
      </select>
      <span v-if="editor.config.style.logo && editor.config.style.ecLevel !== 'H'"
        class="text-xs text-amber-600">H recommended with a logo</span>
    </label>
  </SectionCard>
</template>
