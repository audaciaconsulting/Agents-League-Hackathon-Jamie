# Prompt Log

- Prompt: Move any interfaces into their own files under `src/app/interfaces`, then update any references.
- Response: Split the inline Angular interfaces into dedicated files and updated imports to point at the new interface modules.

## Changed Surface

- `client/src/app/components/app/app.ts`
- `client/src/app/components/recommendation-card/recommendation-card.component.ts`
- `client/src/app/interfaces/analyze-response.interface.ts`
- `client/src/app/interfaces/recommendation.interface.ts`
- `client/src/app/interfaces/source-profile.interface.ts`
- `client/src/app/interfaces/source-status.interface.ts`

## Notes

- Kept behavior unchanged; only type locations and imports moved.
- Preserved the existing component structure and typing relationships between analysis response data, source status data, and recommendation data.