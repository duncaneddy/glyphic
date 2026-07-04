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
    getCurrentWindow()
      .setTheme(theme.value === "auto" ? null : theme.value)
      .catch(() => {});
  });

  async function persist(patch: Settings) {
    persisted = { ...persisted, ...patch };
    await setSettings(persisted);
  }

  async function init(): Promise<Settings> {
    try {
      persisted = await getSettings();
    } catch {
      persisted = {}; // first launch or missing backend — keep defaults
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
