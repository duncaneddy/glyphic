export interface Corners { tl: number; tr: number; br: number; bl: number }
export const NO_CORNERS: Corners = { tl: 0, tr: 0, br: 0, bl: 0 };

const num = (n: number) => +n.toFixed(4);

/** Clockwise rounded rect path with independent corner radii (SVG arcs). */
export function roundedRectPath(x: number, y: number, w: number, h: number, r: Corners): string {
  const p: string[] = [`M${num(x + r.tl)},${num(y)}`];
  p.push(`H${num(x + w - r.tr)}`);
  if (r.tr) p.push(`A${r.tr},${r.tr} 0 0 1 ${num(x + w)},${num(y + r.tr)}`);
  p.push(`V${num(y + h - r.br)}`);
  if (r.br) p.push(`A${r.br},${r.br} 0 0 1 ${num(x + w - r.br)},${num(y + h)}`);
  p.push(`H${num(x + r.bl)}`);
  if (r.bl) p.push(`A${r.bl},${r.bl} 0 0 1 ${num(x)},${num(y + h - r.bl)}`);
  p.push(`V${num(y + r.tl)}`);
  if (r.tl) p.push(`A${r.tl},${r.tl} 0 0 1 ${num(x + r.tl)},${num(y)}`);
  p.push("Z");
  return p.join("");
}

export function circlePath(cx: number, cy: number, r: number): string {
  return (
    `M${num(cx - r)},${num(cy)}` +
    `A${r},${r} 0 1 0 ${num(cx + r)},${num(cy)}` +
    `A${r},${r} 0 1 0 ${num(cx - r)},${num(cy)}Z`
  );
}
