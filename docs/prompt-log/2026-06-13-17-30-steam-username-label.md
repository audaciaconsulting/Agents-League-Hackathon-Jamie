---
description: "Show the Steam username next to the avatar in the Steam source card"
---

## Prompt

In the ui, where you have placed the steam user image, next to it is the word "Steam"
can you update this to be the username of the user instead

## Response

Updated the Steam source card rendering so the visible name now uses the Steam profile's
`steamID` when available, with `Steam` kept as the fallback label.

The avatar alt text also follows the displayed username for consistency.
