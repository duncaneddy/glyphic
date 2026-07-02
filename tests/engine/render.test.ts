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

  it("gives distinct gradients distinct ids so inlined SVGs don't collide on url(#glyphic-fill)", () => {
    const svgA = renderSvg(cfg({ fill: { type: "linear", from: "#000", to: "#fff", angleDeg: 0 } })).svg;
    const svgB = renderSvg(cfg({ fill: { type: "linear", from: "#111", to: "#eee", angleDeg: 0 } })).svg;
    const idA = svgA.match(/<linearGradient id="([^"]+)"/)?.[1];
    const idB = svgB.match(/<linearGradient id="([^"]+)"/)?.[1];
    expect(idA).toBeTruthy();
    expect(idB).toBeTruthy();
    expect(idA).not.toBe(idB);
    expect(svgA).toContain(`url(#${idA})`);
  });

  it("gives identical fills with identical content the same gradient id", () => {
    const fill = { type: "radial", from: "#123456", to: "#654321" } as const;
    const url = "https://example.com/abc";
    const idA = renderSvg(cfg({ fill }, url)).svg.match(/<radialGradient id="([^"]+)"/)?.[1];
    const idB = renderSvg(cfg({ fill }, url)).svg.match(/<radialGradient id="([^"]+)"/)?.[1];
    expect(idA).toBeTruthy();
    expect(idA).toBe(idB);
  });

  it("gives identical fills with different content lengths different gradient ids", () => {
    const fill = { type: "linear", from: "#000", to: "#fff", angleDeg: 45 } as const;
    const shortUrl = "https://e.co";
    const longUrl = "https://example.com/abc?very=long&url=with&many=parameters&to&change&qr&size";
    const idShort = renderSvg(cfg({ fill }, shortUrl)).svg.match(/<linearGradient id="([^"]+)"/)?.[1];
    const idLong = renderSvg(cfg({ fill }, longUrl)).svg.match(/<linearGradient id="([^"]+)"/)?.[1];
    expect(idShort).toBeTruthy();
    expect(idLong).toBeTruthy();
    expect(idShort).not.toBe(idLong);
  });

  it("escapes a hostile background/eye color so no markup or attribute breakout survives", () => {
    const hostile = '"/><image href=x onerror=alert(1)>';
    const { svg } = renderSvg(cfg({
      background: hostile,
      customEyeColor: true,
      eyeFrameColor: hostile,
      eyeBallColor: hostile,
    }));
    expect(svg).not.toContain("<image href=x");
    expect(svg).not.toContain(hostile);
    expect(svg).toContain("&quot;/&gt;&lt;image href=x onerror=alert(1)&gt;");
  });

  it("escapes hostile gradient stop colors", () => {
    const hostile = '"/><image href=x onerror=alert(1)>';
    const { svg } = renderSvg(cfg({ fill: { type: "linear", from: hostile, to: "#fff", angleDeg: 0 } }));
    expect(svg).not.toContain("<image href=x");
    expect(svg).not.toContain(hostile);
  });
});
