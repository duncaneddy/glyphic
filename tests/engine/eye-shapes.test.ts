import { describe, expect, it } from "vitest";
import { eyeBallPath, eyeFramePath } from "../../src/engine/eye-shapes";
import { EYE_BALL_SHAPES, EYE_FRAME_SHAPES } from "../../src/engine/types";
import { renderSvg } from "../../src/engine/render";
import { decodeSvg } from "../helpers/decode";
import { cfg } from "./render.test";

describe("eye shapes", () => {
  it("frames contain two closed subpaths (outer + inner hole)", () => {
    for (const s of EYE_FRAME_SHAPES) {
      expect((eyeFramePath(s, 0, 0).match(/Z/g) ?? []).length).toBe(2);
    }
  });

  it("circle frame uses arcs; square frame does not", () => {
    expect(eyeFramePath("circle", 0, 0)).toContain("A");
    expect(eyeFramePath("square", 0, 0)).not.toContain("A");
  });

  it("balls emit one closed subpath", () => {
    for (const s of EYE_BALL_SHAPES) {
      expect((eyeBallPath(s, 0, 0).match(/Z/g) ?? []).length).toBe(1);
    }
  });

  it.each(EYE_FRAME_SHAPES)("decodes with eye frame %s", (frame) => {
    const { svg } = renderSvg(cfg({ eyeFrameShape: frame, eyeBallShape: "circle" }));
    expect(decodeSvg(svg)).toBe("https://example.com/abc");
  });

  it("custom eye colors appear in the output", () => {
    const { svg } = renderSvg(cfg({ customEyeColor: true, eyeFrameColor: "#0000ff", eyeBallColor: "#ff0000" }));
    expect(svg).toContain('fill="#0000ff"');
    expect(svg).toContain('fill="#ff0000"');
    expect(decodeSvg(svg)).toBe("https://example.com/abc");
  });
});
