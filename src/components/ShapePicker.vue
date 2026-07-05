<script setup lang="ts">
import type { ShapePreview } from "../lib/shape-previews";

defineProps<{
  label: string;
  options: readonly string[];
  previews: Record<string, ShapePreview>;
  modelValue: string;
}>();
const emit = defineEmits<{ "update:modelValue": [string] }>();
</script>

<template>
  <div>
    <p class="mb-1 text-xs font-medium text-gray-500 dark:text-neutral-400">{{ label }}</p>
    <div class="grid grid-cols-4 gap-1">
      <button v-for="opt in options" :key="opt" :title="opt"
        class="aspect-square rounded border p-1 [&>svg]:h-full [&>svg]:w-full"
        :class="opt === modelValue
          ? 'border-gray-900 bg-gray-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900' : 'border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-[#3a3a3a] dark:text-neutral-400 dark:hover:bg-[#333333]'"
        @click="emit('update:modelValue', opt)">
        <svg :viewBox="previews[opt].viewBox">
          <path :d="previews[opt].d" fill="currentColor" :fill-rule="previews[opt].fillRule" />
        </svg>
      </button>
    </div>
  </div>
</template>
