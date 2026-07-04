<script setup lang="ts">
import { ref } from "vue";
defineProps<{ title: string }>();
const open = ref(true);
</script>

<template>
  <section class="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <button class="flex w-full items-center justify-between px-4 py-2 text-left font-medium"
      @click="open = !open">
      {{ title }}
      <span class="text-gray-400 dark:text-gray-500">{{ open ? "−" : "+" }}</span>
    </button>
    <div v-show="open" class="border-t border-gray-100 px-4 py-2 space-y-3 dark:border-gray-800">
      <slot />
    </div>
  </section>
</template>
