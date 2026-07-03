import { ref } from "vue";

const toast = ref<string | null>(null);
let timer: ReturnType<typeof setTimeout> | undefined;

export function useToast() {
  return { toast };
}

export function showToast(text: string, ms = 1400) {
  toast.value = text;
  clearTimeout(timer);
  timer = setTimeout(() => {
    toast.value = null;
  }, ms);
}
