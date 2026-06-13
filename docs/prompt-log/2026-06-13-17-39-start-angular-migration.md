## Prompt

Start implementation for migrating the current vanilla web app to Angular and
TypeScript.

## Response

I scaffolded a new Angular client in `client/`, switched the repo's dev path
from browser-sync to an Angular dev server, and replaced the placeholder app
with a typed UI that calls the existing `/api/analyze` endpoint.

## Notes

- Kept the existing Node API boundary intact.
- Added a proxy so the Angular client can talk to the backend during local
  development.
- Rebuilt the UI in Angular templates and component state instead of direct DOM
  manipulation.