## Prompt

Start implementation.

## Response

Implemented a first polish slice in the Angular client, focused on the
recommendation cards and the app test surface.

### Changes

- Added a scoped stylesheet for the recommendation card to match the existing
  card system and improve visual polish.
- Updated the recommendation card template to use clearer semantic structure
  with a small eyebrow label, a heading, and accessible card labeling.
- Marked the recommendation card as standalone and wired in its stylesheet.
- Switched the recommendation list tracking from `$index` to `item.title` for
  more stable rendering.
- Expanded the recommendation card spec to cover the fallback label when
  confidence is missing.
- Made the app's `recommendations` state public so the component spec can set
  it directly without a protected-member compile error.

### Validation

- `npm --prefix src/client run test -- --watch=false`

### Notes

- `ng test --run` was not supported by this repo's Angular test runner.
- `--browsers=ChromeHeadless` also failed because the current unit-test setup
  expects Vitest-style execution rather than a browser-specific flag.