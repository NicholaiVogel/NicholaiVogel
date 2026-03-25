# UTILITIES

related guides: [[AGENTS.md|root guide]], [[src/assets/AGENTS.md|assets guide]]

**Type:** Node.js executables + helpers
**Count:** 5 files

## OVERVIEW

Mixed directory: executable scripts and utility functions. Known deviation from standard, since scripts often live in a dedicated `scripts/` folder.

## FILES

| File | Type | Purpose |
|------|------|---------|
| [[src/utils/convert-to-avif.js|convert-to-avif.js]] | Executable | Batch image conversion to AVIF format |
| [[src/utils/git-commit.js|git-commit.js]] | Executable | Auto-generate commit messages |
| [[src/utils/notepad.js|notepad.js]] | Executable | Quick notes → auto-commit + deploy |
| [[src/utils/reading-time.ts|reading-time.ts]] | Helper | Calculate reading time (200 wpm) |
| [[src/utils/.env.example|.env.example]] | Config | Environment variable template |

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

- **Executables** use `#!/usr/bin/env node` or are called via package scripts
- **Helpers** are importable, like [[src/utils/reading-time.ts|reading-time.ts]]
- **Notepad** auto-commits and can optionally deploy

## NOTES

- Scripts run from project root
- [[src/utils/convert-to-avif.js|convert-to-avif.js]] requires the `sharp` package
- [[src/utils/git-commit.js|git-commit.js]] handles commit message generation
- [[src/utils/notepad.js|notepad.js]] appends to `dev/continuity.md` with timestamp
