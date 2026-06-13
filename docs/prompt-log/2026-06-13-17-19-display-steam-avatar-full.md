---
description: "Display the Steam avatarFull image in the Steam source sections"
---

## Prompt

The web app queries steam, and somewhere the response contains an image url called "avatarFull". Can you update the webapp to display this image in the steam sections

## Response

Updated the client-side Steam source rendering so any Steam profile with an `avatarFull` URL now shows the avatar image inside the Steam connector card.

The avatar is rendered only for the Steam section, uses a circular thumbnail treatment, and keeps the existing connector text/details intact.