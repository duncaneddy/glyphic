import { describe, expect, it } from "vitest";
import { resolveFill } from "../../src/engine/fills";

describe("resolveFill", () => {
  it("solid returns the color directly with no defs", () => {
    expect(resolveFill({ type: "solid", color: "#123456" }, "f", 33))
      .toEqual({ defs: "", ref: "#123456" });
  });

  it("linear at 0deg spans left-to-right across the extent", () => {
    const { defs, ref } = resolveFill({ type: "linear", from: "#000", to: "#fff", angleDeg: 0 }, "f", 100);
    expect(ref).toBe("url(#f)");
    expect(defs).toContain('gradientUnits="userSpaceOnUse"');
    expect(defs).toContain('x1="0"');
    expect(defs).toContain('x2="100"');
    expect(defs).toContain('y1="50"');
    expect(defs).toContain('y2="50"');
    expect(defs).toContain('stop-color="#000"');
    expect(defs).toContain('stop-color="#fff"');
  });

  it("linear at 90deg spans top-to-bottom", () => {
    const { defs } = resolveFill({ type: "linear", from: "#000", to: "#fff", angleDeg: 90 }, "f", 100);
    expect(defs).toContain('y1="0"');
    expect(defs).toContain('y2="100"');
  });

  it("radial centers on the extent", () => {
    const { defs, ref } = resolveFill({ type: "radial", from: "#000", to: "#fff" }, "g", 100);
    expect(ref).toBe("url(#g)");
    expect(defs).toContain('cx="50"');
    expect(defs).toContain('cy="50"');
  });
});
