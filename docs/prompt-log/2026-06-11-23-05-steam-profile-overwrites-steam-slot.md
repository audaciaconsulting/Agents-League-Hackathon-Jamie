---
description: "Keep PlayStation in the connector list and overwrite the Steam slot with Steam profile data"
---

## Prompt

When the web app makes an API call to get the steam profile, the information is
being added to the bottom of this section, overwriting the playstation section.
I'd like to keep the playstation section, and have it overwrite the steam
section instead?

## Response

Changed the analyzer so the Steam profile result replaces the first source slot,
which is now the Steam entry.

That keeps the PlayStation connector in place and ensures Steam profile data
updates the Steam section instead of overwriting PlayStation.