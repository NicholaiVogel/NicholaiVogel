# UTILITIES

**Type:** Node.js executables + helpers
**Count:** 5 files

## OVERVIEW

Mixed directory: executable scripts AND utility functions. Known deviation from standard (scripts typically in `scripts/`).

## FILES

| File | Type | Purpose |
|------|------|---------|
| `convert-to-avif.js` | Executable | Batch image conversion to AVIF format |
| `git-commit.js` | Executable | Auto-generate commit messages (Hubert persona) |
| `notepad.js` | Executable | Quick notes → auto-commit + deploy |
| `reading-time.ts` | Helper | Calculate reading time (200 wpm) |
| `env.example` | Config | Environment variable template |

## USAGE

```bash
# AVIF conversion
node src/utils/convert-to-avif.js --jpeg --quality 80
node src/utils/convert-to-avif.js --all

# Git automation
pnpm commit                    # Interactive
pnpm commit --accept --push   # Fully automated

# Notepad
pnpm notepad "message"        # Appends to dev/continuity.md
```

## PATTERNS

- **Executables** use `#!/usr/bin/env node` or called via `pnpm script`
- **Helpers** importable (`reading-time.ts`)
- **Notepad** auto-commits and optionally deploys

## NOTES

- Scripts run from project root
- `convert-to-avif.js` requires `sharp` package
- `git-commit.js` uses Claude Code API for message generation
- Notepad appends to `dev/continuity.md` with timestamp
