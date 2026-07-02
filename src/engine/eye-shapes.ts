import { circlePath, roundedRectPath, NO_CORNERS, type Corners } from "./geometry";
import type { EyeBallShape, EyeFrameShape } from "./types";

const all = (r: number): Corners => ({ tl: r, tr: r, br: r, bl: r });
const leaf = (r: number): Corners => ({ tl: r, tr: 0, br: r, bl: 0 });

/** 7x7 finder frame at (x, y): outer outline + inner 5x5 hole, for fill-rule="evenodd". */
export function eyeFramePath(shape: EyeFrameShape, x: number, y: number): string {
  switch (shape) {
    case "square":
      return roundedRectPath(x, y, 7, 7, NO_CORNERS) + roundedRectPath(x + 1, y + 1, 5, 5, NO_CORNERS);
    case "rounded":
      return roundedRectPath(x, y, 7, 7, all(2)) + roundedRectPath(x + 1, y + 1, 5, 5, all(1.2));
    case "extra-rounded":
      return roundedRectPath(x, y, 7, 7, all(3)) + roundedRectPath(x + 1, y + 1, 5, 5, all(2));
    case "circle":
      return circlePath(x + 3.5, y + 3.5, 3.5) + circlePath(x + 3.5, y + 3.5, 2.5);
    case "leaf":
      return roundedRectPath(x, y, 7, 7, leaf(3)) + roundedRectPath(x + 1, y + 1, 5, 5, leaf(2));
  }
}

/** 3x3 eyeball centered in the finder at (x, y). */
export function eyeBallPath(shape: EyeBallShape, x: number, y: number): string {
  const bx = x + 2, by = y + 2;
  switch (shape) {
    case "square":
      return roundedRectPath(bx, by, 3, 3, NO_CORNERS);
    case "rounded":
      return roundedRectPath(bx, by, 3, 3, all(1));
    case "circle":
      return circlePath(bx + 1.5, by + 1.5, 1.5);
    case "leaf":
      return roundedRectPath(bx, by, 3, 3, leaf(1.5));
    case "diamond":
      return `M${bx + 1.5},${by}L${bx + 3},${by + 1.5}L${bx + 1.5},${by + 3}L${bx},${by + 1.5}Z`;
  }
}
