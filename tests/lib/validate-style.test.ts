import { describe, it, expect } from "vitest";
import { isValidStyle } from "../../src/lib/validate-style";
import { defaultStyle } from "../../src/engine/types";

describe("isValidStyle", () => {
  it("accepts valid solid style", () => {
    const style = defaultStyle();
    expect(isValidStyle(style)).toBe(true);
  });

  it("accepts valid linear style with all gradient fields", () => {
    const style = defaultStyle();
    style.fill = { type: "linear", from: "#ff0000", to: "#0000ff", angleDeg: 45 };
    expect(isValidStyle(style)).toBe(true);
  });

  it("accepts valid radial style with gradient fields", () => {
    const style = defaultStyle();
    style.fill = { type: "radial", from: "#ff0000", to: "#0000ff" };
    expect(isValidStyle(style)).toBe(true);
  });

  it("rejects linear style missing from field", () => {
    const style = defaultStyle();
    style.fill = { type: "linear", to: "#0000ff", angleDeg: 45 } as any;
    expect(isValidStyle(style)).toBe(false);
  });

  it("rejects linear style missing to field", () => {
    const style = defaultStyle();
    style.fill = { type: "linear", from: "#ff0000", angleDeg: 45 } as any;
    expect(isValidStyle(style)).toBe(false);
  });

  it("rejects linear style missing angleDeg field", () => {
    const style = defaultStyle();
    style.fill = { type: "linear", from: "#ff0000", to: "#0000ff" } as any;
    expect(isValidStyle(style)).toBe(false);
  });

  it("rejects linear style with non-finite angleDeg", () => {
    const style = defaultStyle();
    style.fill = { type: "linear", from: "#ff0000", to: "#0000ff", angleDeg: Infinity };
    expect(isValidStyle(style)).toBe(false);
  });

  it("rejects radial style missing from field", () => {
    const style = defaultStyle();
    style.fill = { type: "radial", to: "#0000ff" } as any;
    expect(isValidStyle(style)).toBe(false);
  });

  it("rejects radial style missing to field", () => {
    const style = defaultStyle();
    style.fill = { type: "radial", from: "#ff0000" } as any;
    expect(isValidStyle(style)).toBe(false);
  });

  it("rejects solid style with missing color field", () => {
    const style = defaultStyle();
    style.fill = { type: "solid" } as any;
    expect(isValidStyle(style)).toBe(false);
  });

  it("rejects solid style with non-string color", () => {
    const style = defaultStyle();
    style.fill = { type: "solid", color: 123 } as any;
    expect(isValidStyle(style)).toBe(false);
  });

  it("accepts full valid style with knockoutMode box", () => {
    const style = defaultStyle();
    style.fill = { type: "linear", from: "#ff0000", to: "#0000ff", angleDeg: 45 };
    style.logo = {
      src: "data:image/png;base64,iVBORw0KGgo=",
      sizeRatio: 0.2,
      knockout: true,
      knockoutMode: "box",
    };
    expect(isValidStyle(style)).toBe(true);
  });

  it("accepts full valid style with knockoutMode shape", () => {
    const style = defaultStyle();
    style.fill = { type: "radial", from: "#ff0000", to: "#0000ff" };
    style.logo = {
      src: "data:image/png;base64,iVBORw0KGgo=",
      sizeRatio: 0.15,
      knockout: true,
      knockoutMode: "shape",
    };
    expect(isValidStyle(style)).toBe(true);
  });

  it("accepts valid style with a well-formed logo and mask", () => {
    const style = defaultStyle();
    style.logo = {
      src: "data:image/png;base64,iVBORw0KGgo=",
      sizeRatio: 0.2,
      knockout: true,
      knockoutMode: "shape",
      mask: { size: 8, data: "iVBORw0KGgo=" },
    };
    expect(isValidStyle(style)).toBe(true);
  });

  it("accepts style with logo set to null", () => {
    const style = defaultStyle();
    style.logo = null;
    expect(isValidStyle(style)).toBe(true);
  });

  it("rejects logo missing required fields", () => {
    const style = defaultStyle();
    style.logo = {} as any;
    expect(isValidStyle(style)).toBe(false);
  });

  it("rejects logo with a mask whose data is not valid base64", () => {
    const style = defaultStyle();
    style.logo = {
      src: "data:image/png;base64,iVBORw0KGgo=",
      sizeRatio: 0.2,
      knockout: true,
      mask: { size: 8, data: "!!!not-base64!!!" },
    };
    expect(isValidStyle(style)).toBe(false);
  });

  it("accepts template with incomplete linear gradient (should now fail)", () => {
    const templateStyle = {
      fill: { type: "linear" },
      background: "#ffffff",
      bodyShape: "square",
      eyeFrameShape: "square",
      eyeBallShape: "square",
      customEyeColor: false,
      eyeFrameColor: "#000000",
      eyeBallColor: "#000000",
      logo: null,
      ecLevel: "M",
      quietZone: 2,
    } as any;
    expect(isValidStyle(templateStyle)).toBe(false);
  });
});
