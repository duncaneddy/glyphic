import { chamferedRectPath, circlePath, roundedRectPath, NO_CORNERS, type Corners } from "./geometry";
import type { BodyShape } from "./types";

export interface Neighbors { up: boolean; down: boolean; left: boolean; right: boolean }

/** Round only corners with no orthogonal neighbor on either adjacent side. */
function freeCorners(n: Neighbors, r: number): Corners {
  return {
    tl: n.up || n.left ? 0 : r,
    tr: n.up || n.right ? 0 : r,
    br: n.down || n.right ? 0 : r,
    bl: n.down || n.left ? 0 : r,
  };
}

export function bodyModulePath(shape: BodyShape, x: number, y: number, n: Neighbors): string {
  switch (shape) {
    case "square":
      return roundedRectPath(x, y, 1, 1, NO_CORNERS);
    case "dots":
      // r=0.5 (tangent circles): empirically required — jsQR cannot decode r<=0.48 dots
      return circlePath(x + 0.5, y + 0.5, 0.5);
    case "rounded":
      return roundedRectPath(x, y, 1, 1, freeCorners(n, 0.35));
    case "extra-rounded":
      return roundedRectPath(x, y, 1, 1, freeCorners(n, 0.5));
    case "classy":
      return roundedRectPath(x, y, 1, 1, {
        tl: n.up || n.left ? 0 : 0.5, tr: 0,
        br: n.down || n.right ? 0 : 0.5, bl: 0,
      });
    case "classy-rounded":
      return roundedRectPath(x, y, 1, 1, {
        tl: n.up || n.left ? 0 : 0.5,
        tr: n.up || n.right ? 0 : 0.25,
        br: n.down || n.right ? 0 : 0.5,
        bl: n.down || n.left ? 0 : 0.25,
      });
    case "classy-sharp":
      return chamferedRectPath(x, y, 1, 1, {
        tl: n.up || n.left ? 0 : 0.35, tr: 0,
        br: n.down || n.right ? 0 : 0.35, bl: 0,
      });
    case "vertical-bars":
      return roundedRectPath(x + 0.125, y, 0.75, 1, {
        tl: n.up ? 0 : 0.375, tr: n.up ? 0 : 0.375,
        br: n.down ? 0 : 0.375, bl: n.down ? 0 : 0.375,
      });
    case "horizontal-bars":
      return roundedRectPath(x, y + 0.125, 1, 0.75, {
        tl: n.left ? 0 : 0.375, bl: n.left ? 0 : 0.375,
        tr: n.right ? 0 : 0.375, br: n.right ? 0 : 0.375,
      });
  }
}
