import { defineStore } from "pinia";
import { computed, ref, watchEffect } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getSettings, setSettings, type Settings } from "../lib/ipc";
import type { QrStyle } from "../engine/types";
import {
  normalizeAppSettings,
  previewSurfaceStyle,
  resolveTheme,
  type PreviewBg,
  type ThemeSetting,
} from "../lib/theme";

export const useSettingsStore = defineStore("settings", () => {
  const theme = ref<ThemeSetting>("auto");
  const previewBg = ref<PreviewBg>({ enabled: false, color: "#ffffff" });
  // Everything ever loaded/saved, so writes never clobber keys we don't own.
  let persisted: Settings = {};

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const osPrefersDark = ref(media.matches);
  media.addEventListener("change", (e) => (osPrefersDark.value = e.matches));

  const effectiveTheme = computed(() => resolveTheme(theme.value, osPrefersDark.value));

  watchEffect(() => {
    document.documentElement.classList.toggle("dark", effectiveTheme.value === "dark");
    // Native chrome (titlebar tint, dialogs). No-op outside Tauri (e.g. plain vite dev).
    try {
      getCurrentWindow()
        .setTheme(theme.value === "auto" ? null : theme.value)
        .catch(() => {});
    } catch {
      /* not running inside Tauri */
    }
  });

  // Serialize writes: concurrent set_settings calls could otherwise land out of
  // order and leave an older snapshot on disk.
  let writeQueue: Promise<void> = Promise.resolve();

  function persist(patch: Settings): Promise<void> {
    persisted = { ...persisted, ...patch };
    const snapshot = persisted;
    const write = writeQueue.then(() => setSettings(snapshot));
    writeQueue = write.catch(() => {});
    return write;
  }

  async function init(): Promise<Settings> {
    let loaded: Settings = {};
    try {
      loaded = await getSettings();
    } catch {
      /* first launch or missing backend — keep defaults */
    }
    // Writes that raced the load win over what was on disk.
    const raced = Object.keys(persisted).length > 0;
    persisted = { ...loaded, ...persisted };
    if (raced) {
      // A pre-load write captured a snapshot missing the on-disk keys;
      // queue a write of the merged state to heal the file.
      void persist({});
    }
    const n = normalizeAppSettings(persisted);
    theme.value = n.theme;
    previewBg.value = n.previewBg;
    return persisted;
  }

  function setTheme(t: ThemeSetting) {
    theme.value = t;
    void persist({ theme: t });
  }

  function setPreviewBg(v: PreviewBg) {
    previewBg.value = { ...v };
    void persist({ previewBg: { ...v } });
  }

  const saveLastStyle = (style: QrStyle) => persist({ lastStyle: style });

  const surfaceStyle = (qrBackground: string | null) =>
    previewSurfaceStyle(qrBackground, previewBg.value);

  return { theme, previewBg, effectiveTheme, init, setTheme, setPreviewBg, saveLastStyle, surfaceStyle };
});
