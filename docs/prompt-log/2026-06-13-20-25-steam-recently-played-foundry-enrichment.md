## Prompt
Start implementation

## Response
Added Steam recently played games enrichment to the server flow.

- Added a Steam Web API helper that fetches and normalizes the five most
  recently played games from the configurable Steam endpoint.
- Passed the recent-games data and warning/status information through
  `analyzeGamertag` into the payload sent to Foundry.
- Updated the Foundry prompt to treat recent Steam play history as the
  strongest direct signal when it is available.
- Documented `STEAM_WEB_API_URL` and `STEAM_WEB_API_KEY` in `.env.example`
  and `README.md`.
- Added Node test coverage for the new helper and validated the change with
  `node --test src/lib/platforms.test.js` and `npm run check`.
