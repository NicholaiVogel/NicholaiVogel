---
name: git-worktree-setup
description: Interactive git worktree creation through guided Q&A. Use when users want to set up multiple git worktrees, need help naming worktrees, or want to create worktrees with proper branch associations. Handles cases like "set up worktrees for my project", "create git worktrees", "help me organize work with worktrees", or any request involving creating multiple working directories for different branches.
---

# Git Worktree Setup

Interactive tool for creating git worktrees through a guided question-and-answer process. Each worktree gets its own directory and branch, perfect for working on multiple features simultaneously.

## Quick Start

Run the setup script in any git repository:

```bash
python scripts/setup_worktrees.py
```

The script will:
1. Show current repository and existing worktrees
2. Ask how many worktrees to create
3. For each worktree:
   - Ask about the purpose
   - Suggest intelligent directory and branch names
   - Confirm whether to create a new branch or use existing
4. Create all worktrees
5. Provide tmux commands for easy access

## Workflow

### Step 1: Verify Context

Before running the script, confirm the user is in a git repository:

```bash
# Check if in a git repo
git rev-parse --show-toplevel
```

### Step 2: Run Interactive Setup

Execute the script:

```bash
python /mnt/skills/user/git-worktree-setup/scripts/setup_worktrees.py
```

The script handles all user interaction directly via stdin/stdout. Let it run and gather responses from the user.

### Step 3: Provide Context for Answers

Help users answer the questions effectively:

**"What's the purpose of this worktree?"**
- Suggest based on context: "feature", "bugfix", "refactor", etc.
- Use descriptive names: "api-v2", "redesign-ui", "update-deps"

**"Worktree directory name?"**
- Script auto-suggests based on purpose
- Convention: `repo-name-purpose` (e.g., `myapp-api-v2`)
- Placed in parent directory alongside main repo

**"Branch name?"**
- Usually matches worktree name
- Can differ if checking out existing branch

**"Create new branch?"**
- "y" for new work (creates branch from current)
- "n" to checkout existing branch

### Step 4: Post-Setup

After creation, the script outputs:
- Summary of created worktrees
- Suggested tmux commands
- Cleanup commands for later

Guide users on next steps based on their workflow (tmux, Claude Code usage, etc.).

## Example Interaction

```
🌳 Git Worktree Interactive Setup

📂 Repository: myproject
🌿 Current branch: main

📍 Existing worktrees:
/home/user/myproject  abc123 [main]

❓ How many worktrees do you want to create? [1]: 2

============================================================
Worktree 1/2
============================================================
What's the purpose of this worktree? [feature-1]: api refactor
Worktree directory name [api-refactor]: myproject-api
Branch name [myproject-api]: 
Create new branch? (y/n) [y]: 

🔧 Creating worktree: git worktree add -b myproject-api ../myproject-api
✅ Worktree created at: /home/user/myproject-api

============================================================
Worktree 2/2
============================================================
What's the purpose of this worktree? [feature-2]: ui updates
Worktree directory name [ui-updates]: 
Branch name [ui-updates]: 
Create new branch? (y/n) [y]: 

🔧 Creating worktree: git worktree add -b ui-updates ../ui-updates
✅ Worktree created at: /home/user/ui-updates

============================================================
✨ Summary
============================================================

Created 2 worktree(s):

  • myproject-api
    Path: /home/user/myproject-api
    Branch: myproject-api

  • ui-updates
    Path: /home/user/ui-updates
    Branch: ui-updates

💡 Suggested tmux workflow:
  tmux new-window -n 'myproject-api' -c /home/user/myproject-api
  tmux new-window -n 'ui-updates' -c /home/user/ui-updates
```

## Common Use Cases

**Multiple features simultaneously**
- Create worktree per feature
- Each gets isolated branch
- Switch contexts without stashing

**Long-running branches**
- Keep stable branches checked out
- Main branch always ready
- Development branches isolated

**Testing different approaches**
- Experiment in separate worktrees
- Compare implementations side-by-side
- Easy cleanup if approach fails

## Integration with tmux/Claude Code

After creating worktrees, users typically want to:

1. **Create tmux windows**: Use the suggested commands from output
2. **Run Claude Code in each**: `cd <worktree> && claude-code`
3. **Switch contexts**: tmux window navigation
4. **Independent work**: Each Claude Code instance isolated to its worktree

## Cleanup

When done with a worktree:

```bash
# Remove worktree and delete branch
git worktree remove <path>
git branch -d <branch-name>

# Force remove if needed
git worktree remove --force <path>
```

## Best Practices

- Use descriptive worktree names that indicate purpose
- Place worktrees in parent directory for easy organization
- Create new branches for new work (default)
- Use existing branches only when explicitly needed
- Keep worktree count manageable (5-10 max typically)
- Remove worktrees when done to avoid clutter
