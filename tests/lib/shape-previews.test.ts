import { describe, expect, it } from "vitest";
import { bodyPreview, eyeBallPreview, eyeFramePreview } from "../../src/lib/shape-previews";
import { BODY_SHAPES, EYE_BALL_SHAPES, EYE_FRAME_SHAPES } from "../../src/engine/types";

describe("bodyPreview", () => {
  it.each(BODY_SHAPES)("emits a closed path with the expected viewBox (%s)", (shape) => {
    const preview = bodyPreview(shape);
    expect(preview.viewBox).toBe("-0.4 -0.4 3.8 3.8");
    expect(preview.d.startsWith("M")).toBe(true);
    expect(preview.d.endsWith("Z")).toBe(true);
  });

  it("reflects neighbor-aware joining: vertical-bars column has fewer arcs than dots", () => {
    const bars = bodyPreview("vertical-bars");
    const dots = bodyPreview("dots");
    const square = bodyPreview("square");
    expect(bars.d).not.toBe(square.d);
    const barsArcs = (bars.d.match(/A/g) ?? []).length;
    const dotsArcs = (dots.d.match(/A/g) ?? []).length;
    expect(barsArcs).toBeLessThan(dotsArcs);
  });
});

describe("eyeFramePreview", () => {
  it.each(EYE_FRAME_SHAPES)("emits an outer+inner closed path with evenodd fill rule (%s)", (shape) => {
    const preview = eyeFramePreview(shape);
    expect(preview.viewBox).toBe("-0.4 -0.4 7.8 7.8");
    expect(preview.fillRule).toBe("evenodd");
    expect(preview.d.startsWith("M")).toBe(true);
    expect((preview.d.match(/Z/g) ?? []).length).toBe(2);
  });
});

describe("eyeBallPreview", () => {
  it.each(EYE_BALL_SHAPES)("emits a closed path with the expected viewBox (%s)", (shape) => {
    const preview = eyeBallPreview(shape);
    expect(preview.viewBox).toBe("1.6 1.6 3.8 3.8");
    expect(preview.d.startsWith("M")).toBe(true);
    expect(preview.d.endsWith("Z")).toBe(true);
  });
});
