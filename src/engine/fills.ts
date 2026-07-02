import type { Fill } from "./types";

export interface ResolvedFill { defs: string; ref: string }

const num = (n: number) => +n.toFixed(4); // avoid 6.123e-17 noise in SVG

/** Escape a value interpolated into an SVG attribute (double-quoted). */
export function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Derive a gradient id from the fill and extent (djb2 hash of their JSON) so distinct
 * gradients never collide when many rendered SVGs are inlined into one document
 * (e.g. Library/Templates via v-html) — url(#id) resolves to the first match in
 * the document, not the nearest one. Because gradients use gradientUnits="userSpaceOnUse"
 * with coordinates computed from the extent, identical fills with different extents
 * (different QR sizes) must have different ids to avoid geometry collision.
 */
export function fillId(fill: Fill, extent: number): string {
  const s = JSON.stringify(fill) + ":" + extent;
  let hash = 5381;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 33) ^ s.charCodeAt(i);
  }
  return `glyphic-fill-${(hash >>> 0).toString(36)}`;
}

export function resolveFill(fill: Fill, id: string, extent: number): ResolvedFill {
  switch (fill.type) {
    case "solid":
      return { defs: "", ref: escapeAttr(fill.color) };
    case "linear": {
      const rad = (fill.angleDeg * Math.PI) / 180;
      const c = extent / 2;
      const dx = (Math.cos(rad) * extent) / 2;
      const dy = (Math.sin(rad) * extent) / 2;
      const defs =
        `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" ` +
        `x1="${num(c - dx)}" y1="${num(c - dy)}" x2="${num(c + dx)}" y2="${num(c + dy)}">` +
        `<stop offset="0" stop-color="${escapeAttr(fill.from)}"/>` +
        `<stop offset="1" stop-color="${escapeAttr(fill.to)}"/>` +
        `</linearGradient>`;
      return { defs, ref: `url(#${id})` };
    }
    case "radial": {
      const c = extent / 2;
      const defs =
        `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" ` +
        `cx="${num(c)}" cy="${num(c)}" r="${num(extent * 0.6)}">` +
        `<stop offset="0" stop-color="${escapeAttr(fill.from)}"/>` +
        `<stop offset="1" stop-color="${escapeAttr(fill.to)}"/>` +
        `</radialGradient>`;
      return { defs, ref: `url(#${id})` };
    }
  }
}
