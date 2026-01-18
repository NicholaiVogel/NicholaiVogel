---
name: submodule
description: Add git submodules with proper registration, verification, and optional commit
---

# Git Submodule Workflow

Add git submodules correctly with full verification to prevent registration issues.

## Usage

- `/submodule <url> <path>` - Add submodule with specified URL and path
- `/submodule` - Interactive mode, will prompt for URL and path

## Workflow

### Step 1: Gather Information

If not provided, ask the user for:
- **Repository URL** (required) - The git repository to add as submodule
- **Target path** (required) - Where to place the submodule (relative to project root)

### Step 2: Pre-flight Checks

Before adding, verify:

```bash
# Check if path already exists
ls -la <path> 2>/dev/null && echo "WARNING: Path exists"

# Check if already in .gitmodules
grep -q "<path>" .gitmodules 2>/dev/null && echo "WARNING: Already in .gitmodules"

# Check current submodule status
git submodule status
```

If path exists but isn't a proper submodule, it may need cleanup first.

### Step 3: Add Submodule

```bash
git submodule add <url> <path>
```

### Step 4: Verify Registration (4-Point Check)

All four checks must pass:

```bash
# 1. Check .gitmodules has entry
grep -A2 "<path>" .gitmodules

# 2. Check git submodule status shows it
git submodule status | grep "<path>"

# 3. Check .git/modules/<path>/ exists
ls .git/modules/<path>/

# 4. Check submodule has proper .git file
cat <path>/.git
# Should show: gitdir: ../../.git/modules/<path>
```

### Step 5: Recovery (If Verification Fails)

If the submodule exists but isn't registered:

```bash
# Remove from index without deleting files
git rm --cached <path>

# Re-add properly
git submodule add <url> <path>
```

If .gitmodules entry exists but submodule isn't in index:

```bash
# Re-register existing directory
git submodule add <url> <path>
```

### Step 6: Stage and Review

```bash
# Check what's staged
git status

# Should show:
#   new file:   .gitmodules (if first submodule or modified)
#   new file:   <path>
```

### Step 7: Commit (Optional)

If user wants to commit:

```bash
git commit -m "chore: add <name> git submodule at <path>"
```

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "already exists in index" | Path was added but not as submodule | `git rm --cached <path>` then re-add |
| Shows as untracked directory | Submodule not in git index | Run `git submodule add` on existing dir |
| Warning about embedded repo | Directory has .git but not registered | Use `git submodule add` not `git clone` |
