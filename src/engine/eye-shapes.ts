import { roundedRectPath, NO_CORNERS } from "./geometry";
import type { EyeBallShape, EyeFrameShape } from "./types";

/** 7x7 finder frame at (x, y): outer outline + inner 5x5 hole, for fill-rule="evenodd". */
export function eyeFramePath(shape: EyeFrameShape, x: number, y: number): string {
  return roundedRectPath(x, y, 7, 7, NO_CORNERS) + roundedRectPath(x + 1, y + 1, 5, 5, NO_CORNERS);
}

/** 3x3 eyeball centered in the finder at (x, y). */
export function eyeBallPath(shape: EyeBallShape, x: number, y: number): string {
  return roundedRectPath(x + 2, y + 2, 3, 3, NO_CORNERS);
}
