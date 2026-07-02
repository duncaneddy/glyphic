import { describe, expect, it } from "vitest";
import { logoLayout } from "../../src/engine/logo";
import { renderSvg } from "../../src/engine/render";
import { decodeSvg } from "../helpers/decode";
import { cfg } from "./render.test";

// 1x1 red PNG
const DOT =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("logo", () => {
  it("layout centers the logo", () => {
    const l = logoLayout({ src: DOT, sizeRatio: 0.2, knockout: true }, 100);
    expect(l.size).toBe(20);
    expect(l.x).toBe(40);
    expect(l.y).toBe(40);
    expect(l.warning).toBeUndefined();
  });

  it("layout warns above 0.25 ratio", () => {
    expect(logoLayout({ src: DOT, sizeRatio: 0.3, knockout: true }, 100).warning).toBeTruthy();
  });

  it("render embeds the image and surfaces the warning", () => {
    const { svg, warnings } = renderSvg(cfg({
      logo: { src: DOT, sizeRatio: 0.3, knockout: true },
      ecLevel: "H",
    }));
    expect(svg).toContain("<image");
    expect(svg).toContain(DOT);
    expect(warnings.length).toBe(1);
  });

  it("knockout removes modules under the logo but code still decodes at EC H", () => {
    const withLogo = renderSvg(cfg({
      logo: { src: DOT, sizeRatio: 0.2, knockout: true },
      ecLevel: "H",
    })).svg;
    expect(decodeSvg(withLogo, 768)).toBe("https://example.com/abc");
  });

  it("escapes a hostile logo src so it can't break out of the href attribute", () => {
    const hostile = 'data:image/png;base64,x"/><script>alert(1)</script>';
    const { svg } = renderSvg(cfg({ logo: { src: hostile, sizeRatio: 0.2, knockout: true }, ecLevel: "H" }));
    expect(svg).not.toContain("<script>");
    expect(svg).not.toContain('x"/>');
  });
});
