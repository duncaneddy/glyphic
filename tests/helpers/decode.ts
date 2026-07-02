import { Resvg } from "@resvg/resvg-js";
import { PNG } from "pngjs";
import jsQR from "jsqr";

/** Rasterize an SVG and decode it as a QR code. Returns the payload or null. */
export function decodeSvg(svg: string, size = 512): string | null {
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    background: "white", // transparent backgrounds decode poorly
  }).render().asPng();
  const { data, width, height } = PNG.sync.read(Buffer.from(png));
  const pixels = new Uint8ClampedArray(data.buffer, data.byteOffset, data.length);
  return jsQR(pixels, width, height)?.data ?? null;
}
