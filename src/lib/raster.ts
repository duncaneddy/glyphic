/** WebKit needs explicit dimensions on the SVG root to rasterize at the requested scale. */
export function withExplicitSize(svg: string, px: number): string {
  return svg.replace(/^<svg([^>]*)/, (_m, attrs: string) => {
    const cleaned = attrs.replace(/ (width|height)="[^"]*"/g, "");
    return `<svg width="${px}" height="${px}"${cleaned}`;
  });
}

export async function svgToRaster(
  svg: string,
  px: number,
  mime: "image/png" | "image/jpeg" | "image/webp",
): Promise<Uint8Array> {
  const sized = withExplicitSize(svg, px);
  const url = URL.createObjectURL(new Blob([sized], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not rasterize the SVG."));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable.");
    if (mime === "image/jpeg") {
      ctx.fillStyle = "#ffffff"; // JPEG has no alpha; avoid black background
      ctx.fillRect(0, 0, px, px);
    }
    ctx.drawImage(img, 0, 0, px, px);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed."))), mime, 0.92),
    );
    if (blob.type !== mime) throw new Error(`${mime.split("/")[1].toUpperCase()} is not supported on this platform.`);
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}
