import { escapeAttr } from "./fills";
import type { LogoStyle } from "./types";

export interface LogoLayout { x: number; y: number; size: number; warning?: string }

export function logoLayout(logo: LogoStyle, total: number): LogoLayout {
  const size = total * logo.sizeRatio;
  const layout: LogoLayout = { x: (total - size) / 2, y: (total - size) / 2, size };
  if (logo.sizeRatio > 0.25) {
    layout.warning =
      "Large logos can make codes hard to scan. Keep error correction at H and test with a phone camera.";
  }
  return layout;
}

export function logoElement(logo: LogoStyle, l: LogoLayout): string {
  return `<image href="${escapeAttr(logo.src)}" x="${l.x}" y="${l.y}" width="${l.size}" height="${l.size}" preserveAspectRatio="xMidYMid meet"/>`;
}

export type LogoMask = NonNullable<LogoStyle["mask"]>;

// Small cache so repeated maskAlphaAt calls during a single render don't re-decode base64 per module.
const maskCache = new Map<string, Uint8Array>();

function decodeMask(mask: LogoMask): Uint8Array {
  const cached = maskCache.get(mask.data);
  if (cached) return cached;
  const binary = atob(mask.data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  maskCache.set(mask.data, bytes);
  if (maskCache.size > 8) {
    const oldest = maskCache.keys().next().value;
    if (oldest !== undefined) maskCache.delete(oldest);
  }
  return bytes;
}

/** Alpha (0-255) at normalized position u,v in [0,1] within the logo box. */
export function maskAlphaAt(mask: LogoMask, u: number, v: number): number {
  const bytes = decodeMask(mask);
  const x = Math.min(mask.size - 1, Math.max(0, Math.floor(u * mask.size)));
  const y = Math.min(mask.size - 1, Math.max(0, Math.floor(v * mask.size)));
  return bytes[y * mask.size + x] ?? 0;
}
