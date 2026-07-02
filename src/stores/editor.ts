import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { renderSvg, type RenderResult } from "../engine/render";
import { defaultConfig, type QrConfig, type QrStyle } from "../engine/types";

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export const useEditorStore = defineStore("editor", () => {
  const config = ref<QrConfig>(defaultConfig());
  const exportSize = ref(1024);
  const editingTemplateId = ref<string | null>(null);

  const rendered = computed<{ result?: RenderResult; error?: string }>(() => {
    try {
      return { result: renderSvg(config.value) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  });

  function loadConfig(c: QrConfig) {
    config.value = clone(c);
  }
  function applyStyle(s: QrStyle) {
    config.value = { content: config.value.content, style: clone(s) };
  }

  return { config, exportSize, editingTemplateId, rendered, loadConfig, applyStyle };
});
