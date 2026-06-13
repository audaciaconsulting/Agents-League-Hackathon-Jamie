# Prompt Log

## Prompt

Scan the repository for file types first.

Then identify the smallest useful set of missing `.github/instructions` files
from Awesome Copilot.

Copy the upstream instruction content into `.github/instructions/`, keep the
`applyTo` scope specific, and avoid duplicating coverage that already exists.

After the file changes, add a prompt log entry under `docs/prompt-log/` with
the same timestamped filename pattern used by this repo.

## Response

Scanned the workspace file types and confirmed existing coverage for Markdown,
JavaScript, HTML/CSS, and PowerShell. The main missing gap for this repo was
the Angular/TypeScript client surface under `client/`.

Added a new Angular-specific instruction file at
`.github/instructions/angular.instructions.md` with a narrow `applyTo` scope
for `client/src/**/*.{ts,html,css}` plus the Angular config files. The content
focuses on Angular TypeScript patterns, templates, styling, performance,
security, and testing guidance.
