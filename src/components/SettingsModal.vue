<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import ColorInput from "./ColorInput.vue";
import { useSettingsStore } from "../stores/settings";
import { THEME_SETTINGS, type ThemeSetting } from "../lib/theme";

const emit = defineEmits<{ close: [] }>();
const settings = useSettingsStore();
const LABELS: Record<ThemeSetting, string> = { light: "Light", dark: "Dark", auto: "Auto" };

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}
onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <div class="fixed inset-0 z-40 grid place-items-center bg-black/40" @pointerdown.self="emit('close')">
    <div class="w-96 rounded-lg border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-medium">Settings</h2>
        <button class="rounded px-2 py-0.5 text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800"
          aria-label="Close settings" @click="emit('close')">✕</button>
      </div>

      <div class="space-y-4 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">Theme</span>
          <div class="flex overflow-hidden rounded border border-gray-300 dark:border-gray-600">
            <button v-for="t in THEME_SETTINGS" :key="t" class="px-3 py-1"
              :class="settings.theme === t
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
              @click="settings.setTheme(t)">
              {{ LABELS[t] }}
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-4 dark:border-gray-800">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" :checked="settings.previewBg.enabled"
              @change="settings.setPreviewBg({ ...settings.previewBg, enabled: ($event.target as HTMLInputElement).checked })" />
            Preview transparent backgrounds
          </label>
          <ColorInput v-if="settings.previewBg.enabled" :model-value="settings.previewBg.color"
            @update:model-value="settings.setPreviewBg({ ...settings.previewBg, color: $event })" />
        </div>
      </div>
    </div>
  </div>
</template>
