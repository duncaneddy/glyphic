import { describe, expect, it } from "vitest";
import { queryHistory, queryTemplates } from "../../src/lib/library-query";
import type { HistoryEntry, QrContent, Template } from "../../src/engine/types";
import { defaultStyle } from "../../src/engine/types";

function entry(id: string, name: string, createdAt: string, content: QrContent): HistoryEntry {
  return { id, name, createdAt, config: { content, style: defaultStyle() } };
}

function template(id: string, name: string, createdAt: string, updatedAt = createdAt): Template {
  return { id, name, createdAt, updatedAt, style: defaultStyle() };
}

const url = (u: string): QrContent => ({ type: "url", url: u });
const wifi: QrContent = { type: "wifi", ssid: "HomeNet", encryption: "WPA", hidden: false };

const HISTORY: HistoryEntry[] = [
  entry("a", "example.com", "2026-01-03T00:00:00.000Z", url("https://example.com")),
  entry("b", "HomeNet", "2026-01-01T00:00:00.000Z", wifi),
  entry("c", "another.org", "2026-01-02T00:00:00.000Z", url("https://another.org")),
];

const TEMPLATES: Template[] = [
  template("t1", "Bold dots", "2026-01-02T00:00:00.000Z", "2026-01-05T00:00:00.000Z"),
  template("t2", "arctic", "2026-01-03T00:00:00.000Z"),
  template("t3", "Classic", "2026-01-01T00:00:00.000Z", "2026-01-04T00:00:00.000Z"),
];

describe("queryHistory", () => {
  it("defaults to newest first with no filters", () => {
    expect(queryHistory(HISTORY, { search: "", kind: "all", sort: "newest" }).map((e) => e.id))
      .toEqual(["a", "c", "b"]);
  });

  it("sorts oldest first", () => {
    expect(queryHistory(HISTORY, { search: "", kind: "all", sort: "oldest" }).map((e) => e.id))
      .toEqual(["b", "c", "a"]);
  });

  it("sorts by name ascending and descending, case-insensitively", () => {
    expect(queryHistory(HISTORY, { search: "", kind: "all", sort: "name-asc" }).map((e) => e.id))
      .toEqual(["c", "a", "b"]);
    expect(queryHistory(HISTORY, { search: "", kind: "all", sort: "name-desc" }).map((e) => e.id))
      .toEqual(["b", "a", "c"]);
  });

  it("filters by content kind", () => {
    expect(queryHistory(HISTORY, { search: "", kind: "wifi", sort: "newest" }).map((e) => e.id))
      .toEqual(["b"]);
    expect(queryHistory(HISTORY, { search: "", kind: "url", sort: "newest" }).map((e) => e.id))
      .toEqual(["a", "c"]);
  });

  it("matches search case-insensitively against the name", () => {
    expect(queryHistory(HISTORY, { search: "HOME", kind: "all", sort: "newest" }).map((e) => e.id))
      .toEqual(["b"]);
    expect(queryHistory(HISTORY, { search: "  ", kind: "all", sort: "newest" })).toHaveLength(3);
  });

  it("combines search and kind filters", () => {
    expect(queryHistory(HISTORY, { search: "o", kind: "url", sort: "oldest" }).map((e) => e.id))
      .toEqual(["c", "a"]);
    expect(queryHistory(HISTORY, { search: "home", kind: "url", sort: "newest" })).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const input = [...HISTORY];
    queryHistory(input, { search: "", kind: "all", sort: "name-asc" });
    expect(input.map((e) => e.id)).toEqual(["a", "b", "c"]);
  });
});

describe("queryTemplates", () => {
  it("sorts by name ascending and descending, case-insensitively", () => {
    expect(queryTemplates(TEMPLATES, { search: "", sort: "name-asc" }).map((t) => t.id))
      .toEqual(["t2", "t1", "t3"]);
    expect(queryTemplates(TEMPLATES, { search: "", sort: "name-desc" }).map((t) => t.id))
      .toEqual(["t3", "t1", "t2"]);
  });

  it("sorts by creation date", () => {
    expect(queryTemplates(TEMPLATES, { search: "", sort: "newest" }).map((t) => t.id))
      .toEqual(["t2", "t1", "t3"]);
    expect(queryTemplates(TEMPLATES, { search: "", sort: "oldest" }).map((t) => t.id))
      .toEqual(["t3", "t1", "t2"]);
  });

  it("sorts by most recently updated", () => {
    expect(queryTemplates(TEMPLATES, { search: "", sort: "updated" }).map((t) => t.id))
      .toEqual(["t1", "t3", "t2"]);
  });

  it("matches search case-insensitively", () => {
    expect(queryTemplates(TEMPLATES, { search: "cLaS", sort: "name-asc" }).map((t) => t.id))
      .toEqual(["t3"]);
    expect(queryTemplates(TEMPLATES, { search: "no such template", sort: "name-asc" }))
      .toEqual([]);
  });

  it("handles empty input", () => {
    expect(queryTemplates([], { search: "x", sort: "newest" })).toEqual([]);
  });
});
