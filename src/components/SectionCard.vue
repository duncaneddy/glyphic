<script setup lang="ts">
import { ref } from "vue";
defineProps<{ title: string }>();
const open = ref(true);
</script>

<template>
  <section class="rounded-lg border border-gray-200 bg-white dark:border-[#3a3a3a] dark:bg-[#2a2a2a]">
    <button class="flex w-full items-center justify-between px-4 py-2 text-left font-medium"
      @click="open = !open">
      {{ title }}
      <span class="text-gray-400 dark:text-neutral-500">{{ open ? "−" : "+" }}</span>
    </button>
    <div v-show="open" class="border-t border-gray-100 px-4 py-2 space-y-3 dark:border-[#3a3a3a]">
      <slot />
    </div>
  </section>
</template>
