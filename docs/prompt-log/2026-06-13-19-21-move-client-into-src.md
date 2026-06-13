# Prompt Log

## Prompt

Move the `client` folder for the Angular app into the `src` folder, and update any references required.

## Response

Moved the Angular workspace from `client/` to `src/client/`.

Updated the root scripts in [package.json](../../package.json) to use `npm --prefix src/client` for dev, build, and check commands.

Updated [src/server.js](../../src/server.js) so the static asset server points at `src/client/dist/client/browser` and the fallback error message references the new build command.

Updated [README.md](../../README.md) so the server-only path description matches the new Angular build output location.

## Validation

- Stopped the running dev server processes that were locking the old `client/` folder.
- Moved the folder with PowerShell `Move-Item`.
- No build rerun yet after the move and path updates.