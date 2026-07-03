import { describe, expect, it } from "vitest";
import { chamferedRectPath, NO_CORNERS } from "../../src/engine/geometry";

describe("chamferedRectPath", () => {
  it("emits no A commands when all corners are zero", () => {
    const d = chamferedRectPath(0, 0, 1, 1, NO_CORNERS);
    expect(d).not.toContain("A");
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
  });

  it("emits four straight diagonal (L) cuts and no arcs when all corners are chamfered", () => {
    const d = chamferedRectPath(0, 0, 1, 1, { tl: 0.5, tr: 0.5, br: 0.5, bl: 0.5 });
    expect(d).not.toContain("A");
    expect((d.match(/L/g) ?? []).length).toBe(4);
  });

  it("cuts straight from (x, y+c) to (x+c, y) for a chamfered top-left corner", () => {
    const d = chamferedRectPath(0, 0, 1, 1, { tl: 0.5, tr: 0, br: 0, bl: 0 });
    expect(d).toContain("L0.5,0");
  });
});
