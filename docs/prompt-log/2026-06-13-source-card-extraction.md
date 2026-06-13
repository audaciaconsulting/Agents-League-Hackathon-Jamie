# Prompt Log

- Prompt: Examine the `app` file and extract suitable UI elements into new components, with `source-card` as the likely candidate.
- Response: Moved the `source-card` markup into a dedicated standalone `SourceCardComponent`, kept the app flow unchanged, and added a focused component test.

## Changed Surface

- `client/src/app/components/app/app.html`
- `client/src/app/components/app/app.ts`
- `client/src/app/components/source-card/source-card.component.ts`
- `client/src/app/components/source-card/source-card.component.html`
- `client/src/app/components/source-card/source-card.component.css`
- `client/src/app/components/source-card/source-card.component.spec.ts`
- `client/src/styles.css`

## Notes

- The source card now owns its own template and styles, which makes it a cleaner extraction boundary than the app shell.
- Shared shell and recommendation styles stay global for now; only the source-card-specific selectors moved.