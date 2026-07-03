export type EcLevel = "L" | "M" | "Q" | "H";

export type QrContent =
  | { type: "url"; url: string }
  | { type: "email"; address: string; subject?: string; body?: string }
  | { type: "text"; text: string }
  | { type: "phone"; number: string }
  | { type: "sms"; number: string; message?: string }
  | { type: "wifi"; ssid: string; password?: string; encryption: "WPA" | "WEP" | "nopass"; hidden: boolean }
  | { type: "vcard"; firstName: string; lastName?: string; org?: string; title?: string;
      phone?: string; mobile?: string; email?: string; website?: string;
      street?: string; city?: string; zip?: string; state?: string; country?: string }
  | { type: "location"; latitude: number; longitude: number };

export type ContentType = QrContent["type"];

export type Fill =
  | { type: "solid"; color: string }
  | { type: "linear"; from: string; to: string; angleDeg: number }
  | { type: "radial"; from: string; to: string };

export const BODY_SHAPES = [
  "square", "dots", "rounded", "extra-rounded",
  "classy", "classy-rounded", "vertical-bars", "horizontal-bars",
] as const;
export type BodyShape = (typeof BODY_SHAPES)[number];

export const EYE_FRAME_SHAPES = ["square", "rounded", "extra-rounded", "circle", "leaf"] as const;
export type EyeFrameShape = (typeof EYE_FRAME_SHAPES)[number];

export const EYE_BALL_SHAPES = ["square", "rounded", "circle", "leaf", "diamond"] as const;
export type EyeBallShape = (typeof EYE_BALL_SHAPES)[number];

export interface LogoStyle {
  src: string;          // always a data URI (uploads are resolved to data URIs by the UI)
  sizeRatio: number;    // 0.1–0.3 of full code width
  knockout: boolean;    // clear modules behind the logo
}

export interface QrStyle {
  fill: Fill;
  background: string | null;   // null = transparent
  bodyShape: BodyShape;
  eyeFrameShape: EyeFrameShape;
  eyeBallShape: EyeBallShape;
  customEyeColor: boolean;
  eyeFrameColor: string;
  eyeBallColor: string;
  logo: LogoStyle | null;
  ecLevel: EcLevel;
  quietZone: number;           // modules of border, default 2
}

export interface QrConfig { content: QrContent; style: QrStyle }

export interface Template {
  id: string; name: string; style: QrStyle;
  createdAt: string; updatedAt: string;
}
export interface HistoryEntry {
  id: string; name: string; config: QrConfig;
  createdAt: string; previewSvg?: string;
}

export function defaultStyle(): QrStyle {
  return {
    fill: { type: "solid", color: "#000000" },
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
  };
}

export function defaultConfig(): QrConfig {
  return { content: { type: "url", url: "" }, style: defaultStyle() };
}
