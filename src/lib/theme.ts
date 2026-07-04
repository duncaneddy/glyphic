export const THEME_SETTINGS = ["light", "dark", "auto"] as const;
export type ThemeSetting = (typeof THEME_SETTINGS)[number];

export interface PreviewBg {
  enabled: boolean;
  color: string;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export function resolveTheme(setting: ThemeSetting, osPrefersDark: boolean): "light" | "dark" {
  return setting === "auto" ? (osPrefersDark ? "dark" : "light") : setting;
}

/** Persisted settings come from a user-editable JSON file — trust nothing. */
export function normalizeAppSettings(raw: unknown): { theme: ThemeSetting; previewBg: PreviewBg } {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const pb = (obj.previewBg && typeof obj.previewBg === "object" ? obj.previewBg : {}) as Record<string, unknown>;
  return {
    theme: THEME_SETTINGS.includes(obj.theme as ThemeSetting) ? (obj.theme as ThemeSetting) : "auto",
    previewBg: {
      enabled: pb.enabled === true,
      color: typeof pb.color === "string" && HEX.test(pb.color) ? pb.color : "#ffffff",
    },
  };
}

export function previewSurfaceStyle(
  qrBackground: string | null,
  previewBg: PreviewBg,
): { backgroundColor?: string } {
  if (qrBackground !== null) return { backgroundColor: qrBackground };
  return previewBg.enabled ? { backgroundColor: previewBg.color } : {};
}
