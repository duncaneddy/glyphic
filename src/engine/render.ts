import { serializeContent } from "./content";
import { computeMatrix } from "./matrix";
import { escapeAttr, fillId, resolveFill } from "./fills";
import { bodyModulePath } from "./body-shapes";
import { eyeBallPath, eyeFramePath } from "./eye-shapes";
import { logoElement, logoLayout, maskAlphaAt } from "./logo";
import type { QrConfig } from "./types";

export interface RenderResult { svg: string; warnings: string[] }

export function renderSvg(config: QrConfig): RenderResult {
  const { style } = config;
  const warnings: string[] = [];
  const payload = serializeContent(config.content);
  const m = computeMatrix(payload, style.ecLevel);
  const q = style.quietZone;
  const total = m.size + 2 * q;

  const layout = style.logo ? logoLayout(style.logo, total) : null;
  if (layout?.warning) warnings.push(layout.warning);

  // A module is knocked out only when its center falls strictly inside the logo box,
  // so modules run right up to the image edge (the logo is drawn last and covers any overlap).
  // With a mask, only centers under an opaque logo pixel are cleared, so pips follow the
  // artwork's shape instead of its whole bounding box; without one, the whole box is cleared
  // (backward compat with saved configs that predate masks).
  const knocked = (r: number, c: number): boolean => {
    if (!layout || !style.logo?.knockout) return false;
    const cx = c + style.quietZone + 0.5;
    const cy = r + style.quietZone + 0.5;
    const inBox =
      cx > layout.x && cx < layout.x + layout.size &&
      cy > layout.y && cy < layout.y + layout.size;
    if (!inBox) return false;
    const mask = style.logo.mask;
    if (!mask) return true;
    const u = (cx - layout.x) / layout.size;
    const v = (cy - layout.y) / layout.size;
    return maskAlphaAt(mask, u, v) > 16;
  };

  const solidAt = (r: number, c: number): boolean =>
    r >= 0 && r < m.size && c >= 0 && c < m.size &&
    m.isDark(r, c) && !m.isFinder(r, c) && !knocked(r, c);

  let bodyD = "";
  for (let r = 0; r < m.size; r++) {
    for (let c = 0; c < m.size; c++) {
      if (!solidAt(r, c)) continue;
      bodyD += bodyModulePath(style.bodyShape, c + q, r + q, {
        up: solidAt(r - 1, c),
        down: solidAt(r + 1, c),
        left: solidAt(r, c - 1),
        right: solidAt(r, c + 1),
      });
    }
  }

  const fill = resolveFill(style.fill, fillId(style.fill, total), total);
  const frameFill = style.customEyeColor ? escapeAttr(style.eyeFrameColor) : fill.ref;
  const ballFill = style.customEyeColor ? escapeAttr(style.eyeBallColor) : fill.ref;
  const eyeOrigins: Array<[number, number]> = [
    [q, q],                      // top-left
    [q + m.size - 7, q],         // top-right
    [q, q + m.size - 7],         // bottom-left
  ];
  const eyes = eyeOrigins
    .map(([x, y]) =>
      `<path fill-rule="evenodd" fill="${frameFill}" d="${eyeFramePath(style.eyeFrameShape, x, y)}"/>` +
      `<path fill="${ballFill}" d="${eyeBallPath(style.eyeBallShape, x, y)}"/>`)
    .join("");

  const bg = style.background
    ? `<rect width="${total}" height="${total}" fill="${escapeAttr(style.background)}"/>`
    : "";

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}">` +
    (fill.defs ? `<defs>${fill.defs}</defs>` : "") +
    bg +
    `<path fill="${fill.ref}" d="${bodyD}"/>` +
    eyes +
    (layout && style.logo ? logoElement(style.logo, layout) : "") +
    `</svg>`;

  return { svg, warnings };
}
