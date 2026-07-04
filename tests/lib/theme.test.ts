import { describe, expect, it } from "vitest";
import { normalizeAppSettings, previewSurfaceStyle, resolveTheme } from "../../src/lib/theme";

describe("resolveTheme", () => {
  it("returns explicit settings regardless of OS preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the OS preference when set to auto", () => {
    expect(resolveTheme("auto", true)).toBe("dark");
    expect(resolveTheme("auto", false)).toBe("light");
  });
});

describe("normalizeAppSettings", () => {
  it("returns defaults for missing or non-object input", () => {
    for (const raw of [undefined, null, 42, "x", {}]) {
      expect(normalizeAppSettings(raw)).toEqual({
        theme: "auto",
        previewBg: { enabled: false, color: "#ffffff" },
      });
    }
  });

  it("keeps valid persisted values", () => {
    expect(
      normalizeAppSettings({ theme: "dark", previewBg: { enabled: true, color: "#123abc" } }),
    ).toEqual({ theme: "dark", previewBg: { enabled: true, color: "#123abc" } });
  });

  it("falls back per-field on invalid values", () => {
    const n = normalizeAppSettings({ theme: "sepia", previewBg: { enabled: 1, color: "red" } });
    expect(n.theme).toBe("auto");
    expect(n.previewBg).toEqual({ enabled: false, color: "#ffffff" });
  });

  it("ignores unrelated keys like lastStyle", () => {
    expect(normalizeAppSettings({ lastStyle: { x: 1 }, theme: "light" }).theme).toBe("light");
  });
});

describe("previewSurfaceStyle", () => {
  const off = { enabled: false, color: "#00ff00" };
  const on = { enabled: true, color: "#00ff00" };

  it("uses the QR's own background when it has one, regardless of the toggle", () => {
    expect(previewSurfaceStyle("#336699", off)).toEqual({ backgroundColor: "#336699" });
    expect(previewSurfaceStyle("#336699", on)).toEqual({ backgroundColor: "#336699" });
  });

  it("returns no override for transparent QR with the toggle off (app background shows)", () => {
    expect(previewSurfaceStyle(null, off)).toEqual({});
  });

  it("uses the chosen color for transparent QR with the toggle on", () => {
    expect(previewSurfaceStyle(null, on)).toEqual({ backgroundColor: "#00ff00" });
  });
});
