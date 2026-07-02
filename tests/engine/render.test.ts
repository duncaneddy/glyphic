import { describe, expect, it } from "vitest";
import { renderSvg } from "../../src/engine/render";
import { defaultConfig, type QrConfig, type QrStyle } from "../../src/engine/types";
import { EngineError } from "../../src/engine/content";
import { decodeSvg } from "../helpers/decode";

export function cfg(style: Partial<QrStyle> = {}, url = "https://example.com/abc"): QrConfig {
  const c = defaultConfig();
  return { content: { type: "url", url }, style: { ...c.style, ...style } };
}

describe("renderSvg", () => {
  it("produces a well-formed SVG with viewBox = size + 2*quietZone", () => {
    const { svg } = renderSvg(cfg());
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 (\d+) \1">/);
    expect(svg.endsWith("</svg>")).toBe(true);
  });

  it("round-trips: rendered code decodes to the payload", () => {
    expect(decodeSvg(renderSvg(cfg()).svg)).toBe("https://example.com/abc");
  });

  it("round-trips with a linear gradient fill", () => {
    const { svg } = renderSvg(cfg({ fill: { type: "linear", from: "#0b3d91", to: "#6a0dad", angleDeg: 45 } }));
    expect(svg).toContain("<linearGradient");
    expect(decodeSvg(svg)).toBe("https://example.com/abc");
  });

  it("omits the background rect when background is null", () => {
    expect(renderSvg(cfg({ background: null })).svg).not.toContain("<rect");
    expect(renderSvg(cfg({ background: "#fafafa" })).svg).toContain('fill="#fafafa"');
  });

  it("throws EngineError for empty content", () => {
    expect(() => renderSvg(cfg({}, ""))).toThrow(EngineError);
  });

  it("dots body shape still decodes", () => {
    expect(decodeSvg(renderSvg(cfg({ bodyShape: "dots" })).svg)).toBe("https://example.com/abc");
  });
});
