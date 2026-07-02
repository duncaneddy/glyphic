import qrcode from "qrcode-generator";
import { EngineError } from "./content";
import type { EcLevel } from "./types";

// Default stringToBytes truncates char codes to one byte; use real UTF-8.
qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

export interface QrMatrix {
  size: number;
  isDark(row: number, col: number): boolean;
  isFinder(row: number, col: number): boolean;
}

export function computeMatrix(payload: string, ecLevel: EcLevel): QrMatrix {
  const qr = qrcode(0, ecLevel); // typeNumber 0 = auto-select smallest version
  qr.addData(payload, "Byte");
  try {
    qr.make();
  } catch {
    throw new EngineError("Content is too long for a QR code at this error-correction level. Shorten it or lower the level.");
  }
  const size = qr.getModuleCount();
  return {
    size,
    isDark: (r, c) => qr.isDark(r, c),
    isFinder: (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7),
  };
}
