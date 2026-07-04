import type { BodyShape, ContentType, HistoryEntry, Template } from "../engine/types";

export type HistorySort = "newest" | "oldest" | "name-asc" | "name-desc";
export type TemplateSort = "name-asc" | "name-desc" | "newest" | "oldest" | "updated";

export interface HistoryQuery {
  search: string;
  kind: ContentType | "all";
  sort: HistorySort;
}

export interface TemplateQuery {
  search: string;
  bodyShape: BodyShape | "all";
  sort: TemplateSort;
}

export const CONTENT_KIND_LABELS: Record<ContentType, string> = {
  url: "URL",
  email: "Email",
  text: "Text",
  phone: "Phone",
  sms: "SMS",
  wifi: "Wi-Fi",
  vcard: "vCard",
  location: "Location",
};

export const HISTORY_SORT_LABELS: Record<HistorySort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  "name-asc": "Name A–Z",
  "name-desc": "Name Z–A",
};

export const TEMPLATE_SORT_LABELS: Record<TemplateSort, string> = {
  "name-asc": "Name A–Z",
  "name-desc": "Name Z–A",
  newest: "Newest first",
  oldest: "Oldest first",
  updated: "Recently updated",
};

const byName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

function matchesSearch(name: string, search: string): boolean {
  const needle = search.trim().toLowerCase();
  return !needle || name.toLowerCase().includes(needle);
}

export function queryHistory(entries: HistoryEntry[], query: HistoryQuery): HistoryEntry[] {
  const out = entries.filter(
    (e) =>
      (query.kind === "all" || e.config.content.type === query.kind) &&
      matchesSearch(e.name, query.search),
  );
  switch (query.sort) {
    case "newest": out.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
    case "oldest": out.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); break;
    case "name-asc": out.sort(byName); break;
    case "name-desc": out.sort((a, b) => byName(b, a)); break;
  }
  return out;
}

export function queryTemplates(templates: Template[], query: TemplateQuery): Template[] {
  const out = templates.filter(
    (t) =>
      (query.bodyShape === "all" || t.style.bodyShape === query.bodyShape) &&
      matchesSearch(t.name, query.search),
  );
  switch (query.sort) {
    case "name-asc": out.sort(byName); break;
    case "name-desc": out.sort((a, b) => byName(b, a)); break;
    case "newest": out.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
    case "oldest": out.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); break;
    case "updated": out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); break;
  }
  return out;
}
