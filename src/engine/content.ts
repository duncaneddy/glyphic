import type { QrContent } from "./types";

export class EngineError extends Error {}

const escapeWifi = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");

export function serializeContent(content: QrContent): string {
  switch (content.type) {
    case "url": {
      const url = content.url.trim();
      if (!url) throw new EngineError("Enter a URL to generate a code.");
      return url;
    }
    case "email": {
      const address = content.address.trim();
      if (!address) throw new EngineError("Enter an email address.");
      const q = [
        content.subject && `subject=${encodeURIComponent(content.subject)}`,
        content.body && `body=${encodeURIComponent(content.body)}`,
      ].filter(Boolean).join("&");
      return `mailto:${address}${q ? `?${q}` : ""}`;
    }
    case "text": {
      if (!content.text.trim()) throw new EngineError("Enter some text.");
      return content.text;
    }
    case "phone": {
      const n = content.number.trim();
      if (!n) throw new EngineError("Enter a phone number.");
      return `tel:${n}`;
    }
    case "sms": {
      const n = content.number.trim();
      if (!n) throw new EngineError("Enter a phone number.");
      return `SMSTO:${n}:${content.message ?? ""}`;
    }
    case "wifi": {
      if (!content.ssid) throw new EngineError("Enter the network name (SSID).");
      const parts = [`T:${content.encryption}`, `S:${escapeWifi(content.ssid)}`];
      if (content.encryption !== "nopass" && content.password)
        parts.push(`P:${escapeWifi(content.password)}`);
      if (content.hidden) parts.push("H:true");
      return `WIFI:${parts.join(";")};;`;
    }
    case "vcard": {
      if (!content.firstName.trim()) throw new EngineError("Enter at least a first name.");
      const lines = ["BEGIN:VCARD", "VERSION:3.0"];
      lines.push(`N:${content.lastName ?? ""};${content.firstName}`);
      lines.push(`FN:${[content.firstName, content.lastName].filter(Boolean).join(" ")}`);
      if (content.org) lines.push(`ORG:${content.org}`);
      if (content.title) lines.push(`TITLE:${content.title}`);
      if (content.phone) lines.push(`TEL;TYPE=WORK,VOICE:${content.phone}`);
      if (content.mobile) lines.push(`TEL;TYPE=CELL:${content.mobile}`);
      if (content.email) lines.push(`EMAIL:${content.email}`);
      if (content.website) lines.push(`URL:${content.website}`);
      if (content.street || content.city || content.zip || content.state || content.country)
        lines.push(`ADR;TYPE=WORK:;;${content.street ?? ""};${content.city ?? ""};${content.state ?? ""};${content.zip ?? ""};${content.country ?? ""}`);
      lines.push("END:VCARD");
      return lines.join("\r\n");
    }
    case "location":
      return `geo:${content.latitude},${content.longitude}`;
  }
}
