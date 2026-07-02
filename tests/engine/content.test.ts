import { describe, expect, it } from "vitest";
import { serializeContent, EngineError } from "../../src/engine/content";

describe("serializeContent", () => {
  it("url passes through trimmed", () => {
    expect(serializeContent({ type: "url", url: " https://example.com " }))
      .toBe("https://example.com");
  });

  it("empty url throws EngineError", () => {
    expect(() => serializeContent({ type: "url", url: "  " })).toThrow(EngineError);
  });

  it("email builds mailto with encoded subject and body", () => {
    expect(serializeContent({ type: "email", address: "a@b.co", subject: "Hi there", body: "1&2" }))
      .toBe("mailto:a@b.co?subject=Hi%20there&body=1%262");
  });

  it("email without subject/body has no query string", () => {
    expect(serializeContent({ type: "email", address: "a@b.co" })).toBe("mailto:a@b.co");
  });

  it("text passes through raw", () => {
    expect(serializeContent({ type: "text", text: "hello world" })).toBe("hello world");
  });

  it("phone becomes tel:", () => {
    expect(serializeContent({ type: "phone", number: "+1 555 0100" })).toBe("tel:+1 555 0100");
  });

  it("sms becomes SMSTO:number:message", () => {
    expect(serializeContent({ type: "sms", number: "+15550100", message: "yo" }))
      .toBe("SMSTO:+15550100:yo");
  });

  it("wifi escapes special characters and terminates with ;;", () => {
    expect(serializeContent({
      type: "wifi", ssid: "My;Net", password: "p,w:1", encryption: "WPA", hidden: true,
    })).toBe("WIFI:T:WPA;S:My\\;Net;P:p\\,w\\:1;H:true;;");
  });

  it("wifi nopass omits the password field", () => {
    expect(serializeContent({ type: "wifi", ssid: "Open", encryption: "nopass", hidden: false }))
      .toBe("WIFI:T:nopass;S:Open;;");
  });

  it("vcard emits vCard 3.0 with CRLF and address", () => {
    const out = serializeContent({
      type: "vcard", firstName: "Ada", lastName: "Lovelace", org: "Analytical",
      email: "ada@ex.co", city: "London", country: "UK",
    });
    const lines = out.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VCARD");
    expect(lines[1]).toBe("VERSION:3.0");
    expect(lines).toContain("N:Lovelace;Ada");
    expect(lines).toContain("FN:Ada Lovelace");
    expect(lines).toContain("ORG:Analytical");
    expect(lines).toContain("EMAIL:ada@ex.co");
    expect(lines).toContain("ADR;TYPE=WORK:;;;London;;;UK");
    expect(lines[lines.length - 1]).toBe("END:VCARD");
  });

  it("location becomes geo:", () => {
    expect(serializeContent({ type: "location", latitude: 37.42, longitude: -122.08 }))
      .toBe("geo:37.42,-122.08");
  });

  it("location throws EngineError when latitude is cleared (v-model.number leaves \"\")", () => {
    const cleared = { type: "location", latitude: "" as unknown as number, longitude: -122.08 } as const;
    expect(() => serializeContent(cleared)).toThrow(EngineError);
  });

  it("location throws EngineError when longitude is not a finite number", () => {
    expect(() => serializeContent({ type: "location", latitude: 37.42, longitude: NaN }))
      .toThrow(EngineError);
  });
});
