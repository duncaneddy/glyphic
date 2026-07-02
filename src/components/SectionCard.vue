<script setup lang="ts">
import { ref } from "vue";
defineProps<{ title: string }>();
const open = ref(true);
</script>

<template>
  <section class="rounded-lg border border-gray-200 bg-white">
    <button class="flex w-full items-center justify-between px-4 py-3 text-left font-medium"
      @click="open = !open">
      {{ title }}
      <span class="text-gray-400">{{ open ? "−" : "+" }}</span>
    </button>
    <div v-show="open" class="border-t border-gray-100 px-4 py-3 space-y-3">
      <slot />
    </div>
  </section>
</template>
