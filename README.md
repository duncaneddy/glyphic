# Glyphic

Cross-platform desktop QR code studio (Tauri 2 + Vue 3). Design styled QR codes —
colors, gradients, custom eyes, logos, body/eye shapes — export as SVG, PNG, JPEG,
WebP, PDF, or EPS, and manage a library of past codes and reusable style templates.

## Development

- `npm install` — install dependencies
- `npx tauri dev` — run the app with hot reload
- `npm run test` — engine unit tests (Vitest)
- `cd src-tauri && cargo test` — persistence and export tests
- `npm run typecheck` — vue-tsc
- `npx tauri build` — release bundles
- `npm run icons` — regenerate placeholder icons (skips nothing; overwrites all)

## Replacing placeholder icons

Every picker icon is a standalone file in `src/icons/` (24x24 viewBox,
`fill="currentColor"`). Replace a file, keep the name, and the UI picks it up:
`body-<shape>.svg`, `eye-frame-<shape>.svg`, `eyeball-<shape>.svg`,
`logo-preset-<name>.svg`, `action-<name>.svg`.

## Data

Templates, history, and settings are JSON files in the OS app-data directory
(`~/Library/Application Support/dev.duncaneddy.glyphic` on macOS). Template files
are self-contained and shareable.
