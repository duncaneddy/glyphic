import { bodyModulePath, type Neighbors } from "../engine/body-shapes";
import { eyeBallPath, eyeFramePath } from "../engine/eye-shapes";
import type { BodyShape, EyeBallShape, EyeFrameShape } from "../engine/types";

export interface ShapePreview {
  viewBox: string;
  d: string;
  fillRule?: "evenodd";
}

// 1 = dark module.
const BODY_GRID = [
  [1, 1, 0],
  [1, 1, 1],
  [0, 1, 1],
];

function neighborsAt(x: number, y: number): Neighbors {
  const dark = (col: number, row: number): boolean => BODY_GRID[row]?.[col] === 1;
  return {
    up: dark(x, y - 1),
    down: dark(x, y + 1),
    left: dark(x - 1, y),
    right: dark(x + 1, y),
  };
}

export function bodyPreview(shape: BodyShape): ShapePreview {
  let d = "";
  for (let y = 0; y < BODY_GRID.length; y++) {
    for (let x = 0; x < BODY_GRID[y].length; x++) {
      if (BODY_GRID[y][x] === 1) {
        d += bodyModulePath(shape, x, y, neighborsAt(x, y));
      }
    }
  }
  return { viewBox: "-0.4 -0.4 3.8 3.8", d };
}

export function eyeFramePreview(shape: EyeFrameShape): ShapePreview {
  return { viewBox: "-0.4 -0.4 7.8 7.8", d: eyeFramePath(shape, 0, 0), fillRule: "evenodd" };
}

export function eyeBallPreview(shape: EyeBallShape): ShapePreview {
  return { viewBox: "1.6 1.6 3.8 3.8", d: eyeBallPath(shape, 0, 0) };
}
