## Prompt

In this Ui we are showing a users profile.summary, however, sometimes this
contains HTML. I'd like to update this to have some kind of check to see if it
contains HTML and try render it correctly, rather than as a literal string

## Response

Updated the source card to detect HTML-like profile summaries in the Angular
client. The component now renders markup summaries through `[innerHTML]` and
keeps plain text summaries on interpolation, so both cases display correctly.

## Validation

- `npm --prefix src/client run test -- --watch=false`