import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeImage, writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Image } from "@tauri-apps/api/image";
import { svgToRaster } from "./raster";

export type ExportFormat = "svg" | "png" | "jpeg" | "webp" | "pdf" | "eps";

const MIME: Record<string, "image/png" | "image/jpeg" | "image/webp"> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export async function exportAs(
  svg: string,
  format: ExportFormat,
  sizePx: number,
  suggestedName: string,
): Promise<string | null> {
  const path = await save({
    defaultPath: `${suggestedName}.${format}`,
    filters: [{ name: format.toUpperCase(), extensions: [format] }],
  });
  if (!path) return null;

  if (format === "svg") {
    await invoke("write_file", { path, contents: Array.from(new TextEncoder().encode(svg)) });
  } else if (format === "pdf" || format === "eps") {
    await invoke("export_vector", { svg, format, path });
  } else {
    const bytes = await svgToRaster(svg, sizePx, MIME[format]);
    await invoke("write_file", { path, contents: Array.from(bytes) });
  }
  return path;
}

export async function copyPngToClipboard(svg: string, sizePx: number): Promise<void> {
  const png = await svgToRaster(svg, sizePx, "image/png");
  await writeImage(await Image.fromBytes(png.buffer as ArrayBuffer));
}

export async function copySvgToClipboard(svg: string): Promise<void> {
  await writeText(svg);
}
