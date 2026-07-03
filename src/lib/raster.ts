/** WebKit needs explicit dimensions on the SVG root to rasterize at the requested scale. */
export function withExplicitSize(svg: string, px: number): string {
  return svg.replace(/^<svg([^>]*)/, (_m, attrs: string) => {
    const cleaned = attrs.replace(/ (width|height)="[^"]*"/g, "");
    return `<svg width="${px}" height="${px}"${cleaned}`;
  });
}

/** Load an image from a URL/data URI, rejecting with `errorMessage` on failure. */
function loadImage(src: string, errorMessage: string): Promise<HTMLImageElement> {
  const img = new Image();
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(errorMessage));
    img.src = src;
  });
}

const LOGO_SVG_HREF_RE = /(<image[^>]*href=")(data:image\/svg\+xml[^"]*)(")/;

/** Swap an embedded `data:image/svg+xml` logo href for `replacementHref`, unchanged otherwise. */
export function replaceSvgLogoHref(svg: string, replacementHref: string): string {
  return svg.replace(LOGO_SVG_HREF_RE, `$1${replacementHref}$3`);
}

/**
 * EPS export only supports raster images. Rasterize an embedded SVG logo (SVG upload)
 * to a PNG data URI before handing the SVG to the EPS emitter.
 * No-op when there's no svg-data-URI logo to rasterize.
 */
export async function rasterizeSvgLogo(svg: string, px = 1024): Promise<string> {
  const match = svg.match(LOGO_SVG_HREF_RE);
  if (!match) return svg;

  const img = await loadImage(match[2], "Could not rasterize the logo.");
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable.");
  ctx.drawImage(img, 0, 0, px, px);

  return replaceSvgLogoHref(svg, canvas.toDataURL("image/png"));
}

export async function svgToRaster(
  svg: string,
  px: number,
  mime: "image/png" | "image/jpeg" | "image/webp",
): Promise<Uint8Array> {
  const sized = withExplicitSize(svg, px);
  const url = URL.createObjectURL(new Blob([sized], { type: "image/svg+xml" }));
  try {
    const img = await loadImage(url, "Could not rasterize the SVG.");
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
