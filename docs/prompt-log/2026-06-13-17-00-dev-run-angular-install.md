## Prompt

The `npm run dev` workflow was failing and opening Angular CLI source instead of
starting the app.

## Response

I verified the root dev script is correct, installed the missing Angular client
dependencies, and fixed a TypeScript response type in `client/src/app/app.ts`
that was blocking the Angular build.

## Notes

- `npm run dev` now starts the server and Angular client.
- The Angular build previously failed on `typeof this` inside the HTTP response
type.
- The client had no local `node_modules` before the install.
