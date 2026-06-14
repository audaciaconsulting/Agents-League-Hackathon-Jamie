## Prompt
Update the Azure Foundry prompt in `src/lib/foundry.js` so the AI
explicitly does not recommend games that were recently played. The goal is
to return new game recommendations only.

## Response
Updated the prompt wording in `buildPrompt(profile)` to say that the five
most recently played Steam games are a signal only and must not be
recommended back to the user.

## Validation
Ran `node --check src/lib/foundry.js` successfully.
