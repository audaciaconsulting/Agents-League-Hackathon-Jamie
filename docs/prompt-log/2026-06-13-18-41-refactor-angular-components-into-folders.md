## Prompt

Can you refacotr the angular app, moving the components into their own folder each, under a `app/components`

## Response

I moved the Angular components into dedicated folders under `client/src/app/components/`:
- `app` now lives in `client/src/app/components/app/`
- `recommendation-card` now lives in `client/src/app/components/recommendation-card/`

I updated the bootstrap import in `client/src/main.ts` and removed the old top-level component files so the app only has one source of truth per component.

## Validation

- `npm --prefix client run build`
- Build completed successfully.
