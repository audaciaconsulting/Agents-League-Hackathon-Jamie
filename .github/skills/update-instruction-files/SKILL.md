---
name: update-instruction-files
description: Scan the repo for file types, identify missing `.github/instructions` coverage, copy the right Awesome Copilot instruction templates, and log the prompt-driven change. Use when updating or creating instruction files for this workspace.
---

Scan the repository for file types first.

Then identify the smallest useful set of missing `.github/instructions` files from Awesome Copilot.

Copy the upstream instruction content into `.github/instructions/`, keep the `applyTo` scope specific, and avoid duplicating coverage that already exists.

After the file changes, add a prompt log entry under `docs/prompt-log/` with the same timestamped filename pattern used by this repo.