---
applyTo: "scripts/**/*.ps1"
---

# PowerShell Script Standards

- Use `CmdletBinding()` and explicit parameters for any script that may be reused.
- Fail fast with `$ErrorActionPreference = 'Stop'` and `Set-StrictMode -Version Latest` when practical.
- Keep secrets and environment-specific values out of source control.
- Read non-secret configuration from a local file that is ignored by git.
- Prefer generated local files such as `.env.local` or `.local/*` for keys and connection details.
- Validate that required external tools are available before the script starts provisioning work.