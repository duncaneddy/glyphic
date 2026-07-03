<script setup lang="ts">
import SectionCard from "./SectionCard.vue";
import ColorInput from "./ColorInput.vue";
import { useEditorStore } from "../stores/editor";
import type { Fill } from "../engine/types";

const editor = useEditorStore();

function primaryOf(f: Fill): string {
  return f.type === "solid" ? f.color : f.from;
}
function setMode(mode: Fill["type"]) {
  const s = editor.config.style;
  if (s.fill.type === mode) return;
  const from = primaryOf(s.fill);
  const to = s.fill.type === "solid" ? "#4a4a4a" : s.fill.to;
  s.fill =
    mode === "solid" ? { type: "solid", color: from }
    : mode === "linear" ? { type: "linear", from, to, angleDeg: 45 }
    : { type: "radial", from, to };
}
</script>

<template>
  <SectionCard title="Colors">
    <div class="flex gap-1">
      <button v-for="m in (['solid', 'linear', 'radial'] as const)" :key="m"
        class="rounded-full border px-3 py-1 text-xs capitalize"
        :class="editor.config.style.fill.type === m
          ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:bg-gray-100'"
        @click="setMode(m)">
        {{ m === "solid" ? "Single color" : m === "linear" ? "Linear gradient" : "Radial gradient" }}
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <template v-if="editor.config.style.fill.type === 'solid'">
        <label class="inline-flex items-center gap-2">Color
          <ColorInput v-model="editor.config.style.fill.color" /></label>
      </template>
      <template v-else>
        <label class="inline-flex items-center gap-2">From
          <ColorInput v-model="editor.config.style.fill.from" /></label>
        <label class="inline-flex items-center gap-2">To
          <ColorInput v-model="editor.config.style.fill.to" /></label>
        <label v-if="editor.config.style.fill.type === 'linear'" class="inline-flex items-center gap-2">
          Angle
          <input v-model.number="editor.config.style.fill.angleDeg" type="range" min="0" max="360" />
          <span class="w-9 text-xs tabular-nums">{{ editor.config.style.fill.angleDeg }}°</span>
        </label>
      </template>
    </div>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-sm">
      <label class="inline-flex items-center gap-2">
        <input type="checkbox" :checked="editor.config.style.background !== null"
          @change="editor.config.style.background =
            ($event.target as HTMLInputElement).checked ? '#ffffff' : null" />
        Background
      </label>
      <ColorInput v-if="editor.config.style.background !== null"
        v-model="editor.config.style.background" />
    </div>

    <div class="space-y-2 border-t border-gray-100 pt-3 text-sm">
      <label class="flex items-center gap-2">
        <input v-model="editor.config.style.customEyeColor" type="checkbox" /> Custom eye color
      </label>
      <div v-if="editor.config.style.customEyeColor" class="flex flex-wrap gap-x-4 gap-y-2">
        <label class="inline-flex items-center gap-2">Frame
          <ColorInput v-model="editor.config.style.eyeFrameColor" /></label>
        <label class="inline-flex items-center gap-2">Ball
          <ColorInput v-model="editor.config.style.eyeBallColor" /></label>
      </div>
    </div>
  </SectionCard>
</template>
