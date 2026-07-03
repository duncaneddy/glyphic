import { mkdirSync, writeFileSync } from "node:fs";

const R = (x, y, w, h, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;

const icons = {
  // nav / actions (used by Library & Templates views)
  "action-download": `<path d="M11 3h2v10l3.5-3.5L18 11l-6 6-6-6 1.5-1.5L11 13z"/>${R(4, 19, 16, 2)}`,
  "action-copy": `${R(8, 8, 12, 12, 2)}<path d="M4 16V6a2 2 0 0 1 2-2h10v2H6v10z"/>`,
  "action-edit": `<path d="M4 20v-4L15.5 4.5a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L8 20z"/>`,
  "action-trash": `<path d="M6 7h12l-1 14H7zM9 4h6l1 2H8z"/>`,
  "action-duplicate": `${R(7, 7, 13, 13, 2)}<path d="M4 15V5a2 2 0 0 1 2-2h10v2H6v10zM12.5 10.5h2v3h3v2h-3v3h-2v-3h-3v-2h3z"/>`,
};

mkdirSync("src/icons", { recursive: true });
for (const [name, inner] of Object.entries(icons)) {
  writeFileSync(
    `src/icons/${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">${inner}</svg>\n`,
  );
}
console.log(`wrote ${Object.keys(icons).length} icons to src/icons/`);
