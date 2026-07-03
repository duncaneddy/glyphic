import { describe, expect, it } from "vitest";
import { logoLayout, maskAlphaAt } from "../../src/engine/logo";
import { renderSvg } from "../../src/engine/render";
import { decodeSvg } from "../helpers/decode";
import { cfg } from "./render.test";

// 1x1 red PNG
const DOT =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/** Build a synthetic mask (size x size), base64-encoding the alpha bytes like the real pipeline does. */
function buildMask(size: number, alphaAt: (x: number, y: number) => number): { size: number; data: string } {
  const bytes = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) bytes[y * size + x] = alphaAt(x, y);
  }
  return { size, data: Buffer.from(bytes).toString("base64") };
}

// 8x8 mask: left half fully opaque, right half fully transparent.
const LEFT_HALF_OPAQUE = buildMask(8, (x) => (x < 4 ? 255 : 0));

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

  it("knocks out only modules whose center is strictly inside the logo box, leaving no whitespace margin", () => {
    // At sizeRatio 0.16 on this payload/EC-H config the logo box is [13.86, 19.14] x [13.86, 19.14]
    // (module centers land on half-integers). A ±0.5 margin around that box would additionally
    // knock out 24 module-slots that sit just outside the box; tight knockout must render those.
    const { svg } = renderSvg(cfg({
      logo: { src: DOT, sizeRatio: 0.16, knockout: true },
      ecLevel: "H",
    }));
    const bodyD = svg.match(/<path fill="[^"]*" d="([^"]*)"\/>/)?.[1] ?? "";
    const moduleCount = (bodyD.match(/M/g) || []).length;
    // With the old ±0.5-expanded knockout this payload rendered 302 modules; tight knockout
    // must render strictly more (modules right up to the logo edge are no longer cleared).
    expect(moduleCount).toBeGreaterThan(302);
    expect(moduleCount).toBe(314);
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

  describe("maskAlphaAt", () => {
    it("reads the opaque left half and the transparent right half of a synthetic mask", () => {
      expect(maskAlphaAt(LEFT_HALF_OPAQUE, 0.1, 0.5)).toBe(255);
      expect(maskAlphaAt(LEFT_HALF_OPAQUE, 0.9, 0.5)).toBe(0);
    });

    it("clamps out-of-range u,v into the mask bounds", () => {
      expect(maskAlphaAt(LEFT_HALF_OPAQUE, -1, -1)).toBe(255);
      expect(maskAlphaAt(LEFT_HALF_OPAQUE, 2, 2)).toBe(0);
    });
  });

  describe("shape-aware (mask) knockout", () => {
    const moduleCount = (svg: string): number => {
      const bodyD = svg.match(/<path fill="[^"]*" d="([^"]*)"\/>/)?.[1] ?? "";
      return (bodyD.match(/M/g) || []).length;
    };

    it("a mask that's opaque everywhere behaves like the whole-box knockout", () => {
      const allOpaque = buildMask(8, () => 255);
      const withMask = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: true, mask: allOpaque },
        ecLevel: "H",
      })).svg;
      const boxOnly = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: true },
        ecLevel: "H",
      })).svg;
      expect(moduleCount(withMask)).toBe(moduleCount(boxOnly));
    });

    it("a mask that's transparent everywhere knocks out nothing, same as no knockout at all", () => {
      const allTransparent = buildMask(8, () => 0);
      const withMask = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: true, mask: allTransparent },
        ecLevel: "H",
      })).svg;
      const noKnockout = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: false },
        ecLevel: "H",
      })).svg;
      expect(moduleCount(withMask)).toBe(moduleCount(noKnockout));
    });

    it("a half-opaque mask knocks out strictly fewer modules than the whole box, but more than none", () => {
      const halfMask = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: true, mask: LEFT_HALF_OPAQUE },
        ecLevel: "H",
      })).svg;
      const boxOnly = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: true },
        ecLevel: "H",
      })).svg;
      const noKnockout = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: false },
        ecLevel: "H",
      })).svg;
      expect(moduleCount(halfMask)).toBeGreaterThan(moduleCount(boxOnly));
      expect(moduleCount(halfMask)).toBeLessThan(moduleCount(noKnockout));
    });

    it("decodes at EC H with a mask applied", () => {
      const withMask = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.2, knockout: true, mask: LEFT_HALF_OPAQUE },
        ecLevel: "H",
      })).svg;
      expect(decodeSvg(withMask)).toBe("https://example.com/abc");
    });
  });

  describe("knockoutMode", () => {
    const moduleCount = (svg: string): number => {
      const bodyD = svg.match(/<path fill="[^"]*" d="([^"]*)"\/>/)?.[1] ?? "";
      return (bodyD.match(/M/g) || []).length;
    };

    it("mode 'box' clears modules over the transparent half of a mask, ignoring the mask shape", () => {
      const boxMode = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: true, mask: LEFT_HALF_OPAQUE, knockoutMode: "box" },
        ecLevel: "H",
      })).svg;
      const wholeBox = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: true, knockoutMode: "box" },
        ecLevel: "H",
      })).svg;
      // Ignoring the mask means "box" mode renders the same module count whether or not a mask is present.
      expect(moduleCount(boxMode)).toBe(moduleCount(wholeBox));
    });

    it("mode 'shape' keeps modules over the transparent half of a mask, unlike mode 'box'", () => {
      const shapeMode = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: true, mask: LEFT_HALF_OPAQUE, knockoutMode: "shape" },
        ecLevel: "H",
      })).svg;
      const boxMode = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: true, mask: LEFT_HALF_OPAQUE, knockoutMode: "box" },
        ecLevel: "H",
      })).svg;
      expect(moduleCount(shapeMode)).toBeGreaterThan(moduleCount(boxMode));
    });

    it("default (absent knockoutMode) behaves like mode 'shape', keeping modules over the transparent half", () => {
      const defaultMode = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: true, mask: LEFT_HALF_OPAQUE },
        ecLevel: "H",
      })).svg;
      const shapeMode = renderSvg(cfg({
        logo: { src: DOT, sizeRatio: 0.16, knockout: true, mask: LEFT_HALF_OPAQUE, knockoutMode: "shape" },
        ecLevel: "H",
      })).svg;
      expect(moduleCount(defaultMode)).toBe(moduleCount(shapeMode));
    });
  });
});
