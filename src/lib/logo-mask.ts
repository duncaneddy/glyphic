/** Load an image from a data URI. */
function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  return new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load the logo image."));
    img.src = src;
  });
}

function encodeBase64(bytes: Uint8Array): string {
  const CHUNK = 0x8000; // avoid blowing the arg-count limit of String.fromCharCode(...bytes)
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/**
 * Render the logo into a size x size alpha mask, contain-fit and centered exactly like the
 * `<image preserveAspectRatio="xMidYMid meet">` that draws it into the logo box, so a module's
 * normalized position within the box maps directly onto a mask pixel.
 */
export async function buildLogoMask(src: string, size = 48): Promise<{ size: number; data: string }> {
  const img = await loadImage(src);
  if (!img.naturalWidth || !img.naturalHeight) throw new Error("Logo image has no intrinsic size.");

  const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  const dx = (size - w) / 2;
  const dy = (size - h) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable.");
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, dx, dy, w, h);

  const { data } = ctx.getImageData(0, 0, size, size);
  const alpha = new Uint8Array(size * size);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];

  return { size, data: encodeBase64(alpha) };
}
