# Prompt Log

## Prompt

can you add some debug logs to the foundry.js, so I can see if it is working?

## Response

Added focused console logs to src/lib/foundry.js around client creation, offline
fallback selection, request preparation, stream events, successful completion,
and failures.

The logs are prefixed with [foundry] so they are easy to spot in the terminal
while keeping the behavior unchanged.