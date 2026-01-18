#!/usr/bin/env python3
"""
Interactive git worktree setup script.
Guides users through creating multiple worktrees with intelligent naming.
"""

import os
import subprocess
import sys
from pathlib import Path


def run_command(cmd, cwd=None, capture_output=True):
    """Run a shell command and return result."""
    result = subprocess.run(
        cmd,
        shell=True,
        cwd=cwd,
        capture_output=capture_output,
        text=True
    )
    return result


def get_repo_root():
    """Get the git repository root directory."""
    result = run_command("git rev-parse --show-toplevel")
    if result.returncode != 0:
        print("Error: Not in a git repository")
        sys.exit(1)
    return Path(result.stdout.strip())


def get_current_branch():
    """Get the current git branch name."""
    result = run_command("git branch --show-current")
    return result.stdout.strip()


def list_existing_worktrees():
    """List all existing worktrees."""
    result = run_command("git worktree list")
    if result.returncode == 0:
        print("\n📍 Existing worktrees:")
        print(result.stdout)
    return result.stdout


def ask_question(question, default=None):
    """Ask a question and get user input."""
    if default:
        prompt = f"{question} [{default}]: "
    else:
        prompt = f"{question}: "
    
    response = input(prompt).strip()
    return response if response else default


def suggest_worktree_name(purpose, branch_name=None):
    """Generate a suggested worktree name based on purpose."""
    # Clean up the purpose string
    name = purpose.lower().replace(" ", "-")
    # Remove special characters
    name = "".join(c for c in name if c.isalnum() or c in "-_")
    
    if branch_name and branch_name != name:
        return f"{name}"
    return name


def create_worktree(repo_root, worktree_name, branch_name, create_new_branch):
    """Create a git worktree."""
    # Worktree path is parent directory of repo + worktree name
    worktree_path = repo_root.parent / worktree_name
    
    if create_new_branch:
        cmd = f"git worktree add -b {branch_name} {worktree_path}"
    else:
        cmd = f"git worktree add {worktree_path} {branch_name}"
    
    print(f"\n🔧 Creating worktree: {cmd}")
    result = run_command(cmd, cwd=repo_root, capture_output=False)
    
    if result.returncode == 0:
        print(f"✅ Worktree created at: {worktree_path}")
        return worktree_path
    else:
        print(f"❌ Failed to create worktree")
        return None


def main():
    print("🌳 Git Worktree Interactive Setup\n")
    
    # Get repo info
    repo_root = get_repo_root()
    repo_name = repo_root.name
    current_branch = get_current_branch()
    
    print(f"📂 Repository: {repo_name}")
    print(f"🌿 Current branch: {current_branch}")
    
    # Show existing worktrees
    list_existing_worktrees()
    
    # Ask how many worktrees
    num_worktrees = ask_question("\n❓ How many worktrees do you want to create?", "1")
    try:
        num_worktrees = int(num_worktrees)
    except ValueError:
        print("Invalid number, defaulting to 1")
        num_worktrees = 1
    
    worktrees_created = []
    
    # Create each worktree
    for i in range(num_worktrees):
        print(f"\n{'='*60}")
        print(f"Worktree {i+1}/{num_worktrees}")
        print(f"{'='*60}")
        
        # Ask about purpose
        purpose = ask_question(
            "What's the purpose of this worktree?",
            f"feature-{i+1}" if num_worktrees > 1 else "feature"
        )
        
        # Suggest names
        suggested_name = suggest_worktree_name(purpose)
        worktree_name = ask_question(
            "Worktree directory name",
            suggested_name
        )
        
        # Ask about branch
        branch_name = ask_question(
            "Branch name",
            worktree_name
        )
        
        # Ask if creating new branch or checking out existing
        create_new = ask_question(
            "Create new branch? (y/n)",
            "y"
        ).lower() in ['y', 'yes']
        
        # Create the worktree
        path = create_worktree(repo_root, worktree_name, branch_name, create_new)
        if path:
            worktrees_created.append({
                'name': worktree_name,
                'path': path,
                'branch': branch_name
            })
    
    # Summary
    if worktrees_created:
        print(f"\n{'='*60}")
        print("✨ Summary")
        print(f"{'='*60}")
        print(f"\nCreated {len(worktrees_created)} worktree(s):\n")
        
        for wt in worktrees_created:
            print(f"  • {wt['name']}")
            print(f"    Path: {wt['path']}")
            print(f"    Branch: {wt['branch']}")
            print()
        
        print("\n💡 Suggested tmux workflow:")
        for wt in worktrees_created:
            print(f"  tmux new-window -n '{wt['name']}' -c {wt['path']}")
        
        print("\n🧹 To remove a worktree later:")
        print("  git worktree remove <path>")


if __name__ == "__main__":
    main()
