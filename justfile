# List available recipes
default:
    @just --list

# Install all dependencies
setup:
    npm install

# Run the app with hot reload
dev:
    npx tauri dev

# Run all tests (frontend + Rust)
test: test-js test-rust

# Frontend engine tests (Vitest)
test-js:
    npm run test

# Rust persistence/export tests
test-rust:
    cd src-tauri && cargo test

# Type-check the frontend
typecheck:
    npm run typecheck

# Regenerate placeholder icons
icons:
    npm run icons

# Full verification: everything CI runs
check: typecheck test

# Release bundles for the current platform
build:
    npx tauri build

# Set the app version everywhere (e.g. `just set-version 0.3.1`)
set-version version:
    npm version {{version}} --no-git-tag-version --allow-same-version
    perl -0pi -e 's/("version":\s*)"[^"]*"/${1}"{{version}}"/' src-tauri/tauri.conf.json
    perl -i -pe 's/^version = "[^"]*"/version = "{{version}}"/' src-tauri/Cargo.toml
    perl -0pi -e 's/(name = "app"\nversion = )"[^"]*"/${1}"{{version}}"/' src-tauri/Cargo.lock
    @echo "Set version to {{version}} across package.json, package-lock.json, tauri.conf.json, Cargo.toml, Cargo.lock"
