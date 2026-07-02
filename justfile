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
