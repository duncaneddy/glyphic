import { circlePath, roundedRectPath, NO_CORNERS } from "./geometry";
import type { BodyShape } from "./types";

export interface Neighbors { up: boolean; down: boolean; left: boolean; right: boolean }

export function bodyModulePath(shape: BodyShape, x: number, y: number, n: Neighbors): string {
  switch (shape) {
    case "square":
      return roundedRectPath(x, y, 1, 1, NO_CORNERS);
    case "dots":
      // Full-bleed circle (diameter = module width). At r < ~0.49 the rasterized
      // code loses too much ink to anti-aliasing and jsQR fails to locate the
      // pattern — keep coverage near a full square (see render.test.ts round-trip).
      return circlePath(x + 0.5, y + 0.5, 0.5);
    default:
      return roundedRectPath(x, y, 1, 1, NO_CORNERS); // placeholder until Task 7
  }
}
