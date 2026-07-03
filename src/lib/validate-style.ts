import { BODY_SHAPES, EYE_BALL_SHAPES, EYE_FRAME_SHAPES, type QrStyle } from "../engine/types";

const FILL_TYPES = ["solid", "linear", "radial"];
const EC_LEVELS = ["L", "M", "Q", "H"];

export function isValidStyle(s: unknown): s is QrStyle {
  if (!s || typeof s !== "object") return false;
  const style = s as Record<string, unknown>;

  if (!(BODY_SHAPES as readonly string[]).includes(style.bodyShape as string)) return false;
  if (!(EYE_FRAME_SHAPES as readonly string[]).includes(style.eyeFrameShape as string)) return false;
  if (!(EYE_BALL_SHAPES as readonly string[]).includes(style.eyeBallShape as string)) return false;

  const fill = style.fill;
  if (!fill || typeof fill !== "object" || !FILL_TYPES.includes((fill as Record<string, unknown>).type as string)) {
    return false;
  }

  const fillObj = fill as Record<string, unknown>;
  const fillType = fillObj.type as string;

  if (fillType === "solid") {
    if (typeof fillObj.color !== "string") return false;
  } else if (fillType === "linear") {
    if (typeof fillObj.from !== "string") return false;
    if (typeof fillObj.to !== "string") return false;
    const angleDeg = fillObj.angleDeg;
    if (typeof angleDeg !== "number" || !isFinite(angleDeg)) return false;
  } else if (fillType === "radial") {
    if (typeof fillObj.from !== "string") return false;
    if (typeof fillObj.to !== "string") return false;
  }

  if (style.background !== null && typeof style.background !== "string") return false;
  if (!EC_LEVELS.includes(style.ecLevel as string)) return false;

  const logo = style.logo;
  if (logo !== null) {
    if (!logo || typeof logo !== "object") return false;
    const logoObj = logo as Record<string, unknown>;

    if (typeof logoObj.src !== "string") return false;
    if (typeof logoObj.sizeRatio !== "number" || !isFinite(logoObj.sizeRatio)) return false;
    if (typeof logoObj.knockout !== "boolean") return false;

    const knockoutMode = logoObj.knockoutMode;
    if (knockoutMode !== undefined && knockoutMode !== "shape" && knockoutMode !== "box") return false;

    const mask = logoObj.mask;
    if (mask !== undefined) {
      if (!mask || typeof mask !== "object") return false;
      const maskObj = mask as Record<string, unknown>;
      if (typeof maskObj.size !== "number" || !isFinite(maskObj.size)) return false;
      if (typeof maskObj.data !== "string") return false;
      try {
        atob(maskObj.data);
      } catch {
        return false;
      }
    }
  }

  return true;
}
