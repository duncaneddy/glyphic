import { defineStore } from "pinia";
import { ref } from "vue";
import * as ipc from "../lib/ipc";
import type { HistoryEntry, QrConfig, QrStyle, Template } from "../engine/types";

export function summarizeContent(config: QrConfig): string {
  const c = config.content;
  switch (c.type) {
    case "url": return c.url.replace(/^https?:\/\//, "").slice(0, 40);
    case "email": return c.address;
    case "text": return c.text.slice(0, 40);
    case "phone": return c.number;
    case "sms": return c.number;
    case "wifi": return c.ssid;
    case "vcard": return [c.firstName, c.lastName].filter(Boolean).join(" ");
    case "location": return `${c.latitude}, ${c.longitude}`;
  }
}

export const useLibraryStore = defineStore("library", () => {
  const templates = ref<Template[]>([]);
  const history = ref<HistoryEntry[]>([]);

  async function refresh() {
    [templates.value, history.value] = await Promise.all([ipc.listTemplates(), ipc.listHistory()]);
  }

  async function recordHistory(config: QrConfig, svg: string) {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      name: summarizeContent(config) || "Untitled",
      config,
      createdAt: new Date().toISOString(),
      previewSvg: svg,
    };
    await ipc.saveHistoryEntry(entry);
    await refresh();
  }

  async function removeHistory(id: string) {
    await ipc.deleteHistoryEntry(id);
    await refresh();
  }

  async function saveNewTemplate(name: string, style: QrStyle) {
    const now = new Date().toISOString();
    await ipc.saveTemplate({ id: crypto.randomUUID(), name, style, createdAt: now, updatedAt: now });
    await refresh();
  }

  async function updateTemplate(id: string, patch: { name?: string; style?: QrStyle }) {
    const existing = templates.value.find((t) => t.id === id);
    if (!existing) return;
    await ipc.saveTemplate({ ...existing, ...patch, updatedAt: new Date().toISOString() });
    await refresh();
  }

  async function duplicateTemplate(id: string) {
    const existing = templates.value.find((t) => t.id === id);
    if (!existing) return;
    const now = new Date().toISOString();
    await ipc.saveTemplate({ ...existing, id: crypto.randomUUID(), name: `${existing.name} copy`, createdAt: now, updatedAt: now });
    await refresh();
  }

  async function removeTemplate(id: string) {
    await ipc.deleteTemplate(id);
    await refresh();
  }

  return {
    templates,
    history,
    refresh,
    recordHistory,
    removeHistory,
    saveNewTemplate,
    updateTemplate,
    duplicateTemplate,
    removeTemplate,
  };
});
