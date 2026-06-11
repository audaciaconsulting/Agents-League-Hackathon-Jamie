---
description: "Collapse the hero section to only the search form after analysis starts"
---

## Prompt

When the user enters a gamertag, and clicks analyse, I would like the entire top
section to be hidden, except the search box and analyse button. The height of
this section should adjust to the now smaller contents.

## Response

Added a body-level `analysis-view` state in the client script when analysis
starts. The hero now collapses to a single column and hides the intro copy,
status content, flow panel, and form label so only the input and Analyze button
remain visible.

The hero card height now shrinks naturally with the hidden content instead of
reserving space for the full top section.