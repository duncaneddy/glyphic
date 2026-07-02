<script setup lang="ts">
const icons = import.meta.glob("../icons/*.svg", {
  query: "?raw", import: "default", eager: true,
}) as Record<string, string>;

defineProps<{ label: string; prefix: string; options: readonly string[]; modelValue: string }>();
const emit = defineEmits<{ "update:modelValue": [string] }>();

function iconFor(prefix: string, value: string): string {
  return icons[`../icons/${prefix}-${value}.svg`] ?? "";
}
</script>

<template>
  <div>
    <p class="mb-1 text-xs font-medium text-gray-500">{{ label }}</p>
    <div class="grid grid-cols-8 gap-1">
      <button v-for="opt in options" :key="opt" :title="opt"
        class="aspect-square rounded border p-1.5 [&>svg]:h-full [&>svg]:w-full"
        :class="opt === modelValue
          ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100'"
        @click="emit('update:modelValue', opt)"
        v-html="iconFor(prefix, opt)" />
    </div>
  </div>
</template>
