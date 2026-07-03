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
  if (logo && typeof logo === "object") {
    const knockoutMode = (logo as Record<string, unknown>).knockoutMode;
    if (knockoutMode !== undefined && knockoutMode !== "shape" && knockoutMode !== "box") return false;
  }

  return true;
}
