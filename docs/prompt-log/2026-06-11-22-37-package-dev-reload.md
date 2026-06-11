# Prompt Log

## Prompt
Can you update the package.json with a command I can run for development, that watches for website changes, and refreshes the page if I update files?

## Timestamp
2026-06-11 22:37 +01:00

## Response
Updated `package.json` with a `dev` workflow that runs the Node server on port 3001
and proxies it through BrowserSync so the page reloads when files in
`src/public` change.

Added `dev:server` and `dev:reload` helper scripts plus the required dev
dependencies: `browser-sync`, `concurrently`, and `cross-env`.

Run `npm install` once to fetch the new dev dependencies, then use `npm run dev`.