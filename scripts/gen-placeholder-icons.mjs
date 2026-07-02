import { mkdirSync, writeFileSync } from "node:fs";

const R = (x, y, w, h, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const grid = (rx) =>
  [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => R(4 + c * 6, 4 + r * 6, 4.5, 4.5, rx))).join("");
const dotsGrid = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => C(6 + c * 6, 6 + r * 6, 2.4))).join("");
const frame = (rx, irx) =>
  `<path fill-rule="evenodd" d="M3 ${3 + rx}a${rx} ${rx} 0 0 1 ${rx}-${rx}h${18 - 2 * rx}a${rx} ${rx} 0 0 1 ${rx} ${rx}v${18 - 2 * rx}a${rx} ${rx} 0 0 1 -${rx} ${rx}h-${18 - 2 * rx}a${rx} ${rx} 0 0 1 -${rx}-${rx}z M8 ${8 + irx}a${irx} ${irx} 0 0 1 ${irx}-${irx}h${8 - 2 * irx}a${irx} ${irx} 0 0 1 ${irx} ${irx}v${8 - 2 * irx}a${irx} ${irx} 0 0 1 -${irx} ${irx}h-${8 - 2 * irx}a${irx} ${irx} 0 0 1 -${irx}-${irx}z"/>`;

const icons = {
  // body shapes
  "body-square": grid(0),
  "body-dots": dotsGrid,
  "body-rounded": grid(1.2),
  "body-extra-rounded": grid(2.2),
  "body-classy": [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) =>
    `<path d="M${4 + c * 6} ${6 + r * 6}a2 2 0 0 1 2-2h2.5v2.5a2 2 0 0 1-2 2h-2.5z"/>`)).join(""),
  "body-classy-rounded": grid(1.6),
  "body-vertical-bars": [0, 1, 2].map((c) => R(5 + c * 6, 4, 4, 16, 2)).join(""),
  "body-horizontal-bars": [0, 1, 2].map((r) => R(4, 5 + r * 6, 16, 4, 2)).join(""),
  // eye frames
  "eye-frame-square": frame(0, 0),
  "eye-frame-rounded": frame(3, 1.5),
  "eye-frame-extra-rounded": frame(6, 3),
  "eye-frame-circle": `<path fill-rule="evenodd" d="M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0-18z M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z"/>`,
  "eye-frame-leaf": `<path fill-rule="evenodd" d="M3 12a9 9 0 0 1 9-9h9v9a9 9 0 0 1-9 9H3z M8 12a4 4 0 0 0 4 4h4v-4a4 4 0 0 0-4-4H8z"/>`,
  // eyeballs
  "eyeball-square": R(7, 7, 10, 10),
  "eyeball-rounded": R(7, 7, 10, 10, 3),
  "eyeball-circle": C(12, 12, 5),
  "eyeball-leaf": `<path d="M7 12a5 5 0 0 1 5-5h5v5a5 5 0 0 1-5 5H7z"/>`,
  "eyeball-diamond": `<path d="M12 6l6 6-6 6-6-6z"/>`,
  // preset logos
  "logo-preset-star": `<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 5.9L12 16.4l-5.3 2.9 1.2-5.9L3.4 9.3l6-.7z"/>`,
  "logo-preset-heart": `<path d="M12 20s-7-4.6-9-9c-1.2-2.7.6-6 3.8-6 2 0 3.5 1.2 4.2 2.5C11.7 6.2 13.2 5 15.2 5c3.2 0 5 3.3 3.8 6-2 4.4-9 9-7 9z"/>`,
  "logo-preset-bolt": `<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>`,
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
