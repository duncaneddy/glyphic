<script setup lang="ts">
defineProps<{ modelValue: string }>();
const emit = defineEmits<{ "update:modelValue": [string] }>();
function onText(e: Event) {
  const v = (e.target as HTMLInputElement).value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) emit("update:modelValue", v);
}
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <input type="color" :value="modelValue" class="h-7 w-9 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
    <input type="text" :value="modelValue" size="7"
      class="min-w-0 rounded border border-gray-300 px-1.5 py-0.5 font-mono text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" @change="onText" />
  </span>
</template>
