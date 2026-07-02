import { describe, expect, it } from "vitest";
import { computeMatrix } from "../../src/engine/matrix";
import { EngineError } from "../../src/engine/content";

describe("computeMatrix", () => {
  it("produces a valid module count (21 + 4k) with dark finder corners", () => {
    const m = computeMatrix("https://example.com", "M");
    expect((m.size - 21) % 4).toBe(0);
    expect(m.isDark(0, 0)).toBe(true);            // finder outer ring
    expect(m.isDark(1, 1)).toBe(false);           // finder inner white ring
    expect(m.isDark(3, 3)).toBe(true);            // finder center
  });

  it("flags exactly the three 7x7 finder regions", () => {
    const m = computeMatrix("hello", "L");
    expect(m.isFinder(0, 0)).toBe(true);
    expect(m.isFinder(6, m.size - 1)).toBe(true);
    expect(m.isFinder(m.size - 1, 6)).toBe(true);
    expect(m.isFinder(m.size - 1, m.size - 1)).toBe(false);
    expect(m.isFinder(8, 8)).toBe(false);
  });

  it("throws EngineError when content exceeds capacity", () => {
    expect(() => computeMatrix("x".repeat(8000), "H")).toThrow(EngineError);
  });

  it("higher EC level never shrinks the matrix", () => {
    const payload = "https://example.com/some/longish/path";
    expect(computeMatrix(payload, "H").size)
      .toBeGreaterThanOrEqual(computeMatrix(payload, "L").size);
  });
});
