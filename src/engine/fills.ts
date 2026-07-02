import type { Fill } from "./types";

export interface ResolvedFill { defs: string; ref: string }

const num = (n: number) => +n.toFixed(4); // avoid 6.123e-17 noise in SVG

export function resolveFill(fill: Fill, id: string, extent: number): ResolvedFill {
  switch (fill.type) {
    case "solid":
      return { defs: "", ref: fill.color };
    case "linear": {
      const rad = (fill.angleDeg * Math.PI) / 180;
      const c = extent / 2;
      const dx = (Math.cos(rad) * extent) / 2;
      const dy = (Math.sin(rad) * extent) / 2;
      const defs =
        `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" ` +
        `x1="${num(c - dx)}" y1="${num(c - dy)}" x2="${num(c + dx)}" y2="${num(c + dy)}">` +
        `<stop offset="0" stop-color="${fill.from}"/>` +
        `<stop offset="1" stop-color="${fill.to}"/>` +
        `</linearGradient>`;
      return { defs, ref: `url(#${id})` };
    }
    case "radial": {
      const c = extent / 2;
      const defs =
        `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" ` +
        `cx="${num(c)}" cy="${num(c)}" r="${num(extent * 0.6)}">` +
        `<stop offset="0" stop-color="${fill.from}"/>` +
        `<stop offset="1" stop-color="${fill.to}"/>` +
        `</radialGradient>`;
      return { defs, ref: `url(#${id})` };
    }
  }
}
