import { describe, expect, it } from "vitest";
import { bodyModulePath, type Neighbors } from "../../src/engine/body-shapes";
import { BODY_SHAPES } from "../../src/engine/types";
import { renderSvg } from "../../src/engine/render";
import { decodeSvg } from "../helpers/decode";
import { cfg } from "./render.test";

const FREE: Neighbors = { up: false, down: false, left: false, right: false };
const ALL: Neighbors = { up: true, down: true, left: true, right: true };

describe("bodyModulePath", () => {
  it("rounded module with no neighbors has four arcs; fully surrounded has none", () => {
    expect((bodyModulePath("rounded", 0, 0, FREE).match(/A/g) ?? []).length).toBe(4);
    expect(bodyModulePath("rounded", 0, 0, ALL)).not.toContain("A");
  });

  it("vertical bars connect through vertical neighbors (no caps between)", () => {
    expect(bodyModulePath("vertical-bars", 0, 0, { ...FREE, down: true })).toContain("A"); // top cap only
    expect(bodyModulePath("vertical-bars", 0, 0, ALL)).not.toContain("A");
  });

  it("classy-sharp free module has straight diagonal corners (L), no arcs", () => {
    const d = bodyModulePath("classy-sharp", 0, 0, FREE);
    expect(d).not.toContain("A");
    expect(d).toContain("L");
  });

  it.each(BODY_SHAPES)("every shape emits a closed path (%s)", (shape) => {
    const d = bodyModulePath(shape, 3, 5, FREE);
    expect(d.startsWith("M")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
  });

  it.each(BODY_SHAPES)("rendered code with body shape %s still decodes", (shape) => {
    expect(decodeSvg(renderSvg(cfg({ bodyShape: shape })).svg)).toBe("https://example.com/abc");
  });
});
