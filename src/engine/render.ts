import { serializeContent } from "./content";
import { computeMatrix } from "./matrix";
import { resolveFill } from "./fills";
import { bodyModulePath } from "./body-shapes";
import { eyeBallPath, eyeFramePath } from "./eye-shapes";
import { logoElement, logoLayout } from "./logo";
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

  // A module is knocked out when its center (+0.5 margin) falls inside the logo box.
  const knocked = (r: number, c: number): boolean => {
    if (!layout || !style.logo?.knockout) return false;
    const cx = c + style.quietZone + 0.5;
    const cy = r + style.quietZone + 0.5;
    return (
      cx > layout.x - 0.5 && cx < layout.x + layout.size + 0.5 &&
      cy > layout.y - 0.5 && cy < layout.y + layout.size + 0.5
    );
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

  const fill = resolveFill(style.fill, "glyphic-fill", total);
  const frameFill = style.customEyeColor ? style.eyeFrameColor : fill.ref;
  const ballFill = style.customEyeColor ? style.eyeBallColor : fill.ref;
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
    ? `<rect width="${total}" height="${total}" fill="${style.background}"/>`
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
