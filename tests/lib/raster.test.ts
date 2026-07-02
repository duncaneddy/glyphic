import { describe, expect, it } from "vitest";
import { withExplicitSize } from "../../src/lib/raster";

describe("withExplicitSize", () => {
  it("injects width and height onto the svg root", () => {
    const out = withExplicitSize('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33"><rect/></svg>', 1024);
    expect(out.startsWith('<svg width="1024" height="1024" ')).toBe(true);
    expect(out).toContain('viewBox="0 0 33 33"');
  });

  it("replaces existing width/height rather than duplicating", () => {
    const out = withExplicitSize('<svg width="10" height="10" viewBox="0 0 5 5"/>', 256);
    expect(out.match(/width=/g)?.length).toBe(1);
    expect(out).toContain('width="256"');
  });

  it("leaves width/height on inner elements untouched", () => {
    const out = withExplicitSize(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33"><rect width="33" height="33" fill="#fff"/></svg>',
      512,
    );
    expect(out).toContain('<rect width="33" height="33" fill="#fff"/>');
    expect(out.startsWith('<svg width="512" height="512" ')).toBe(true);
  });
});
