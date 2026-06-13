## Prompt
This isn't showing in the UI, I think this interface needs to be extended to handle the new information returned, and the ui updated as well to display it

## Response
Extended the client source-status model and source card UI to display recently played Steam game names.

- Added `gameNames?: string[]` to the `SourceStatus` interface.
- Updated the source card component to render the recent game names when present.
- Added a compact styled section for the recently played game list.
- Replaced an invalid theme token with the existing `--accent` color.
- Validated the change with `npm --prefix src/client run build`.
