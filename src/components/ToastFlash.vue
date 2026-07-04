<script setup lang="ts">
import { useToast } from "../lib/toast";

const { toast } = useToast();
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-50 grid place-items-center">
    <Transition enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="toast" class="flex items-center gap-2 rounded-full bg-gray-900/85 px-5 py-2.5 text-sm text-white dark:bg-gray-100/90 dark:text-gray-900">
        <span class="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-green-500">
          <svg viewBox="0 0 12 12" class="h-2.5 w-2.5" fill="none" stroke="white" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M2.5 6.5l2.5 2.5 4.5-5.5" />
          </svg>
        </span>
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>
