## Prompt
The Angular app UI now replaces the UI in `src/public`; can you refactor this codebase to remove that folder?

## Response
Updated the Node server to serve the Angular production build from `client/dist/client/browser` instead of the legacy `src/public` folder.

Changed the root `start` script to build the Angular client first, then launch the server, so the app shell is available without the old static files.

Deleted the legacy `src/public` files and removed the empty directory from the workspace.

Validation:
- `npm run check`
- Confirmed the Angular build succeeds and outputs to `client/dist/client`
