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
